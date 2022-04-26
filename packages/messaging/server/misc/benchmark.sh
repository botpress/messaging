#!/bin/bash

# To run this :
# yarn global add loadtest

clientId=YOUR_CLIENT_ID
clientToken=YOUR_CLIENT_TOKEN
conversationId=YOUR_CONVERSATION_ID
authorId=YOUR_AUTHOR_ID

yarn dlx loadtest http://localhost:3100/api/v1/messages \
 -m POST \
 -T application/json \
 -c 64 \
 -P "{\"conversationId\":\"$conversationId\",\"authorId\":\"$authorId\",\"payload\":{\"type\":\"text\",\"text\":\"Hello this is a text message!\"}}" \
 -H "x-bp-messaging-client-id:${clientId}" \
 -H "x-bp-messaging-client-token:${clientToken}" 
