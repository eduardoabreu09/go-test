export type CreateUserPayload = {
  name: string;
  email: string;
};

export type CreateFirmwarePayload = {
  version: string;
  url: string;
};

export type CreateFarmPayload = {
  version: string;
};

export type CreateUpdatePayload = {
  farm_id: number;
  firmware_version: string;
};
