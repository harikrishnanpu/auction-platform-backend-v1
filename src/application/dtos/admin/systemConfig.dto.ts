export interface ISystemConfigDto {
    id: string;
    key: string;
    value: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface ISystemConfigInputDto {
    key: string;
    value: string;
    description: string | null;
}

export interface IGetSystemConfigsOutputDto {
    configs: ISystemConfigDto[];
}
