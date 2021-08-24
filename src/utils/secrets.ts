import {SecretManagerServiceClient} from '@google-cloud/secret-manager';

export const getSecret = async (secretName: string, secretVersion: number) => {
  const client = new SecretManagerServiceClient();
  const projectId = await client.getProjectId();
  const [version] = await client.accessSecretVersion({
    name: `projects/${projectId}/secrets/${secretName}/versions/${secretVersion}`,
  });
  return version.payload?.data?.toString();
}
