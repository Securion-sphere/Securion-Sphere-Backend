export type ContainerStartRes = {
  ID: string;
  Name: string;
  Image: string;
  Ports: { IP: string; PrivatePort: string; PublicPort: string; Type: string };
  Status: string;
  Created: int64;
};
