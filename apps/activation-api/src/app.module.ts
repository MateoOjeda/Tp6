import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'KAFKA_SERVICE',

        transport: Transport.KAFKA,

        options: {
          client: {
            clientId: 'activation-api',

            brokers: [
              process.env.KAFKA_BROKER ??
                'localhost:9092',
            ],
          },

          consumer: {
            groupId: 'activation-api-group',
          },
        },
      },
    ]),
  ],

  controllers: [AppController],

  providers: [AppService],
})
export class AppModule {}