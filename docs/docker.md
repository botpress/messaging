# Docker

## Minimal Configuration

Build local docker image

```
sudo docker build . -t messaging
```

Run docker container with minimal configurations

```
docker run -d \
--name messaging \
-p 3100:3100 \
-v messaging_data:/messaging/data \
--env EXTERNAL_URL=https://your-external-url.com \
messaging:latest
```

Public docker image incoming

## Recommended Configuration

It's highly recommended to you set an encryption key using `--env ENCRYPTION_KEY=myKey`

Refer to the [configurations doc](./configuration.md) to see what format is accepted for encryption keys
