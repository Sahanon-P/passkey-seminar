import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import {
  AuthenticationResponseJSON,
  AuthenticatorTransportFuture,
  generateAuthenticationOptions,
  generateRegistrationOptions,
  RegistrationResponseJSON,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from '@simplewebauthn/server';

@Injectable()
export class AppService {
  constructor(
    private prismaService: PrismaService,
    private configService: ConfigService,
  ) {}
  getHello(): string {
    return 'Hello World!';
  }

  base64URLStringToBuffer(base64URLString: string): Uint8Array {
    return new Uint8Array(Buffer.from(base64URLString, 'base64url'));
  }

  bufferToBase64URLString(buffer: Uint8Array): string {
    return Buffer.from(buffer).toString('base64url');
  }

  async register(
    email: string,
  ): Promise<PublicKeyCredentialCreationOptionsJSON> {
    const devices = await this.prismaService.device.findMany();
    const user = await this.prismaService.user.upsert({
      where: {
        email,
      },
      update: {},
      create: {
        email,
      },
    });
    const options = await generateRegistrationOptions({
      rpName: 'SimpleWebAuthn Example',
      rpID: this.configService.get('RP_ID'),
      userName: email,
      excludeCredentials: devices.map((device) => {
        return {
          id: device.credentialID,
          transports: device.transport as AuthenticatorTransportFuture[],
        };
      }),
      authenticatorSelection: {
        // Defaults
        residentKey: 'preferred',
        userVerification: 'preferred',
      },
    });
    await this.prismaService.currentOption.upsert({
      where: {
        userId: user.id,
      },
      update: {
        option: JSON.parse(JSON.stringify(options)),
      },
      create: {
        userId: user.id,
        option: JSON.parse(JSON.stringify(options)),
      },
    });
    return options;
  }

  async verifyRegister(email: string, data: RegistrationResponseJSON) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });
    const userOption = await this.prismaService.currentOption.findUnique({
      where: {
        userId: user.id,
      },
    });
    try {
      const verification = await verifyRegistrationResponse({
        response: data,
        expectedChallenge: userOption.option['challenge'],
        expectedOrigin: this.configService.get('ORIGIN'),
        expectedRPID: this.configService.get('RP_ID'),
      });
      const { verified, registrationInfo } = verification;
      const { credential, credentialDeviceType, credentialBackedUp } =
        registrationInfo;
      if (verified) {
        await this.prismaService.device.create({
          data: {
            userId: user.id,
            credentialID: credential.id,
            webauthnUserID: userOption.option['user']['id'],
            credentialPublicKey: this.bufferToBase64URLString(
              credential.publicKey,
            ),
            counter: credential.counter,
            deviceType: credentialDeviceType,
            transport: credential.transports,
            backedUp: credentialBackedUp,
          },
        });
        return {
          verified: true,
        };
      }
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async login(email: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });
    const devices = await this.prismaService.device.findMany({
      where: {
        userId: user.id,
      },
    });
    const options = await generateAuthenticationOptions({
      rpID: this.configService.get('RP_ID'),
      allowCredentials: devices.map((device) => ({
        id: device.credentialID,
        transports: device.transport as AuthenticatorTransportFuture[],
      })),
    });
    await this.prismaService.currentOption.upsert({
      where: {
        userId: user.id,
      },
      update: {
        option: JSON.parse(JSON.stringify(options)),
      },
      create: {
        userId: user.id,
        option: JSON.parse(JSON.stringify(options)),
      },
    });
    return options;
  }

  async verifyLogin(email: string, data: AuthenticationResponseJSON) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });
    const userOption = await this.prismaService.currentOption.findUnique({
      where: {
        userId: user.id,
      },
    });
    const devices = await this.prismaService.device.findUnique({
      where: {
        userId: user.id,
        credentialID: data.id,
      },
    });
    try {
      const verification = await verifyAuthenticationResponse({
        response: data,
        expectedChallenge: userOption.option['challenge'],
        expectedOrigin: this.configService.get('ORIGIN'),
        expectedRPID: this.configService.get('RP_ID'),
        credential: {
          id: devices.credentialID,
          publicKey: this.base64URLStringToBuffer(devices.credentialPublicKey),
          counter: devices.counter,
          transports: devices.transport as AuthenticatorTransportFuture[],
        },
      });
      const { verified, authenticationInfo } = verification;
      const { newCounter } = authenticationInfo;
      if (verified) {
        await this.prismaService.device.update({
          where: {
            credentialID: devices.credentialID,
          },
          data: {
            counter: newCounter,
          },
        });
      }
      return verified;
    } catch (error) {
      throw new Error(error.message);
    }
  }
}
