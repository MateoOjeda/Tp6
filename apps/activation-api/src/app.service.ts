import {
  Inject,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';

import {
  ClientKafka,
} from '@nestjs/microservices';

import { randomUUID } from 'crypto';

import type { CreateActivationDto } from './dto/create-activation.dto.js';

import type { Activation } from './models/activation.model.js';


@Injectable()
export class AppService implements OnModuleInit {

  private readonly activations =
    new Map<string, Activation>();


  constructor(
    @Inject('KAFKA_SERVICE')
    private readonly kafkaClient: ClientKafka,
  ) {}


  async onModuleInit() {
    await this.kafkaClient.connect();

    console.log(
      '✅ activation-api conectado a Kafka',
    );
  }


  async createActivation(
    dto: CreateActivationDto,
  ) {

    const activationId =
      `act-${randomUUID()}`;

    const activation: Activation = {
      activationId,

      customerId: dto.customerId,

      planId: dto.planId,

      status: 'PENDING',

      simulateFailure:
        dto.simulateFailure ?? 'none',

      createdAt:
        new Date().toISOString(),
    };


    this.activations.set(
      activationId,
      activation,
    );


    const event = {

      eventId: randomUUID(),

      eventType: 'ActivationRequested',

      version: 1,

      occurredAt:
        new Date().toISOString(),

      correlationId:
        activationId,

      customerId:
        dto.customerId,

      source:
        'activation-api',

      payload: {

        planId:
          dto.planId,

        channel:
          'web',

        simulateFailure:
          dto.simulateFailure ??
          'none',

      },

    };


    this.kafkaClient.emit(
      'activation.requested',

      {
        key: dto.customerId,

        value: event,
      },
    );


    console.log(
      '📤 ActivationRequested publicado',
      event,
    );


    return {
      activationId,

      status: 'PENDING',
    };
  }


  getActivation(
    activationId: string,
  ) {

    const activation =
      this.activations.get(
        activationId,
      );


    if (!activation) {
      throw new NotFoundException(
        'Activación no encontrada',
      );
    }


    return activation;
  }
}