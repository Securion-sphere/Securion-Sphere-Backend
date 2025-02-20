// Converted from Go type declaration to Typescript
type Port = {
  IP: string;
  PrivatePort: number;
  PublicPort: number;
  Type: string;
};

export type ContainerResponse = {
  ID: string;
  Name: string;
  Image: string;
  Ports: Port[];
  Status: string;
  Created: number;
};
