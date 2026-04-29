import {
    SystemConfigKey,
    SystemConfigValueType,
} from '@domain/entities/system-config/system-config.entity';

export interface ISystemConfigDto {
    id: string;
    key: SystemConfigKey;
    valueType: SystemConfigValueType;
    value: string | number | boolean;
    description: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ISystemConfigInputDto {
    key: SystemConfigKey;
    value: string;
    description: string;
}

export interface IGetSystemConfigsOutputDto {
    configs: ISystemConfigDto[];
}

export interface IGetSystemConfigKeysOutputDto {
    configs: ISystemConfigDto[];
}
