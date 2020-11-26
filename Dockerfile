FROM node:12-alpine

RUN mkdir /isxer
RUN addgroup -S isxer && adduser -S isxer -G isxer
RUN apk --update --no-cache add git gettext bash unzip curl
WORKDIR /isxer
COPY . /isxer
RUN rm -rf ./tests
RUN chown -R isxer:isxer /isxer
USER isxer
RUN npm install
RUN chmod u+x ./isxer
ENV PATH="/isxer:${PATH}"