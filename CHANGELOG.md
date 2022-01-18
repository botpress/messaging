## [0.1.22](https://github.com/botpress/messaging/compare/v0.1.21...v0.1.22) (2022-01-18)



## [0.1.21](https://github.com/botpress/messaging/compare/v0.1.20...v0.1.21) (2022-01-13)


### Bug Fixes

* **channels:** readd clearing and fix auto start ([#297](https://github.com/botpress/messaging/issues/297)) ([8d01733](https://github.com/botpress/messaging/commit/8d01733ce7e6befc78fe91f479e706d32ed2bebe))
* **migration:** fix alter table migration not working with sqlite ([#290](https://github.com/botpress/messaging/issues/290)) ([2599256](https://github.com/botpress/messaging/commit/2599256fe583d9bd0ddd773ee51bbc6f96f20276))


### Features

* **client:** client tokens ([#298](https://github.com/botpress/messaging/issues/298)) ([709f120](https://github.com/botpress/messaging/commit/709f1202f54b53a97909e8894ccd3fbbf638c2be))
* **migrations:** improve migration system ([#299](https://github.com/botpress/messaging/issues/299)) ([c8ae63e](https://github.com/botpress/messaging/commit/c8ae63e2db18a9108b1001da376387a769f1a966))



## [0.1.20](https://github.com/botpress/messaging/compare/v0.1.19...v0.1.20) (2021-12-13)


### Bug Fixes

* **channels:** read the conversation.started event ([#282](https://github.com/botpress/messaging/issues/282)) ([145d4f4](https://github.com/botpress/messaging/commit/145d4f47b158f726439b77c0686ac982f5aa6db3))
* **migrations:** fix migrations with targets that are out of bounds ([#274](https://github.com/botpress/messaging/issues/274)) ([c0e7a50](https://github.com/botpress/messaging/commit/c0e7a5021871c8bf9f429094b427cf4def71940c))
* **sync:** add lock for provider name ([#284](https://github.com/botpress/messaging/issues/284)) ([f92111c](https://github.com/botpress/messaging/commit/f92111c83a083c726d438921f7888cdd0bc93772))


### Features

* **channels:** add conversation.started event ([#266](https://github.com/botpress/messaging/issues/266)) ([67906da](https://github.com/botpress/messaging/commit/67906daa5011db395ecfd707d0a8c1bdd3e102bf))
* **channels:** channels package ([#270](https://github.com/botpress/messaging/issues/270)) ([2dadfee](https://github.com/botpress/messaging/commit/2dadfeea8c5c84a736793822609838cd5c914c4f)), closes [#271](https://github.com/botpress/messaging/issues/271) [#272](https://github.com/botpress/messaging/issues/272)



## [0.1.19](https://github.com/botpress/messaging/compare/v0.1.18...v0.1.19) (2021-11-30)


### Bug Fixes

* **monitoring:** fix listing outdated errored conduits ([#261](https://github.com/botpress/messaging/issues/261)) ([c046dac](https://github.com/botpress/messaging/commit/c046dac8806618109f4afa9c55b6b7f194a98d48))



## [0.1.18](https://github.com/botpress/messaging/compare/v0.1.17...v0.1.18) (2021-11-29)


### Bug Fixes

* **build:** unnecessary params for Docker build ([#248](https://github.com/botpress/messaging/issues/248)) ([9b2bcfc](https://github.com/botpress/messaging/commit/9b2bcfc9407b1544413495540d5ef298108bf4a4))
* **components:** fix carousel component ([#260](https://github.com/botpress/messaging/issues/260)) ([91e7627](https://github.com/botpress/messaging/commit/91e762758734b964f88fba2ac95daa07da7b63eb))
* **docker:** fix path to engine package files ([#253](https://github.com/botpress/messaging/issues/253)) ([3a0c6cb](https://github.com/botpress/messaging/commit/3a0c6cba4ba7185bd22cefa7acf68535132a7cde))
* **mapping:** fix insert race conditions ([#255](https://github.com/botpress/messaging/issues/255)) ([7e070eb](https://github.com/botpress/messaging/commit/7e070eb5fb4bcb40c30ffbdc699df8958b7abc61))
* **monitoring:** fix timeout not being cleared ([#252](https://github.com/botpress/messaging/issues/252)) ([fa5bb3d](https://github.com/botpress/messaging/commit/fa5bb3dafacf6691a88fa867b45380c531460d84))
* **redis:** fix master failure crashing the server ([#258](https://github.com/botpress/messaging/issues/258)) ([f745ae4](https://github.com/botpress/messaging/commit/f745ae43e311dfee8f7ede1c8b61c951a2603cc0))
* **server:** fix response to other node ([#240](https://github.com/botpress/messaging/issues/240)) ([a54b554](https://github.com/botpress/messaging/commit/a54b5548a0a683f1970b7e328b579725b22a44f3)), closes [#241](https://github.com/botpress/messaging/issues/241)
* **test:** fix rewiring with jest ([#250](https://github.com/botpress/messaging/issues/250)) ([32c2679](https://github.com/botpress/messaging/commit/32c267957357ff44cf693bd012c53cb1efc79eff))
* **webhook:** fix webhooks ([#251](https://github.com/botpress/messaging/issues/251)) ([8b4b60f](https://github.com/botpress/messaging/commit/8b4b60fb0dd53959b3a1c7b53fdc8821f0d4080b))


### Features

* **socket:** authenticate in handshake ([#254](https://github.com/botpress/messaging/issues/254)) ([03e1bd4](https://github.com/botpress/messaging/commit/03e1bd43960e8c80daf2905027ca4bb73352e570))
* **webchat:** port webchat injection ([#239](https://github.com/botpress/messaging/issues/239)) ([1edb476](https://github.com/botpress/messaging/commit/1edb476dabf1b44ef2c85c21d97d9af6f803c1f0))



## [0.1.17](https://github.com/botpress/messaging/compare/v0.1.16...v0.1.17) (2021-11-05)


### Bug Fixes

* **channels:** fixes for smooch and messenger ([#229](https://github.com/botpress/messaging/issues/229)) ([42a1d5b](https://github.com/botpress/messaging/commit/42a1d5bdceaf5ba6214db438d6a53e284a9862d9)), closes [#227](https://github.com/botpress/messaging/issues/227) [#230](https://github.com/botpress/messaging/issues/230)


### Features

* **api:** refact implementation ([#223](https://github.com/botpress/messaging/issues/223)) ([c8aa881](https://github.com/botpress/messaging/commit/c8aa881a45f754610f628d4d3bee561103138fb9))
* **socket:** socket package ([#222](https://github.com/botpress/messaging/issues/222)) ([4c1141e](https://github.com/botpress/messaging/commit/4c1141e56001b0795988706bd10b8806b3ee54b5))
* **test-ui:** update testing ui for new socket ([#224](https://github.com/botpress/messaging/issues/224)) ([326f65e](https://github.com/botpress/messaging/commit/326f65eed3f45760205557f1564275f61a0d2464))



## [0.1.16](https://github.com/botpress/messaging/compare/v0.1.15...v0.1.16) (2021-10-28)


### Bug Fixes

* **client:** fix handling of not found errors ([#219](https://github.com/botpress/messaging/issues/219)) ([025f290](https://github.com/botpress/messaging/commit/025f290df02d474f41fd99beed0a08fd5255f5e5))


### Features

* **components:** implement ui components package ([#208](https://github.com/botpress/messaging/issues/208)) ([a469775](https://github.com/botpress/messaging/commit/a46977536f48dbf3a8bcfbb5fff911a061caf00b)), closes [#210](https://github.com/botpress/messaging/issues/210)
* **converse:** close collector when the bot has finished processing ([#217](https://github.com/botpress/messaging/issues/217)) ([ccb2154](https://github.com/botpress/messaging/commit/ccb215467d0f2bd074f0f7ec2064064ef35c1484))
* **twilio:** twilio testing ([#221](https://github.com/botpress/messaging/issues/221)) ([877d448](https://github.com/botpress/messaging/commit/877d448e19d182eff7ac51480a049ef70775191a))
* **user-tokens:** implement user tokens ([#203](https://github.com/botpress/messaging/issues/203)) ([c27fb4d](https://github.com/botpress/messaging/commit/c27fb4dce039cf9ee32ccc048d5b68d8d8422712))



## [0.1.15](https://github.com/botpress/messaging/compare/v0.1.14...v0.1.15) (2021-10-19)


### Bug Fixes

* **channels:** fix typing indicators always on ([#201](https://github.com/botpress/messaging/issues/201)) ([9015457](https://github.com/botpress/messaging/commit/901545795897e05775c8efdedd0165841f1f0086))
* **client:** fix adding custom headers ([#212](https://github.com/botpress/messaging/issues/212)) ([b92ca08](https://github.com/botpress/messaging/commit/b92ca08124dd914673f836d0885d39c84615d697))
* **repo:** typing errors due to unknow error type ([#213](https://github.com/botpress/messaging/issues/213)) ([b13114e](https://github.com/botpress/messaging/commit/b13114e352ceff41f02c7aa1ebb15a9ebf2cc34b))


### Features

* **api:** add a route to get user info ([#195](https://github.com/botpress/messaging/issues/195)) ([7441823](https://github.com/botpress/messaging/commit/744182315f44d8211de3ff13654962d3d19a855e)), closes [#197](https://github.com/botpress/messaging/issues/197) [#198](https://github.com/botpress/messaging/issues/198)
* **converse:** converse api ([#194](https://github.com/botpress/messaging/issues/194)) ([f4ecbca](https://github.com/botpress/messaging/commit/f4ecbcac401e985af2a40eb6815721df3b1c2f63))
* **instances:** message queue ([#207](https://github.com/botpress/messaging/issues/207)) ([335cf3c](https://github.com/botpress/messaging/commit/335cf3c32851057c0f07674167e5d73e8f16b1df))



## [0.1.14](https://github.com/botpress/messaging/compare/v0.1.13...v0.1.14) (2021-10-14)


### Bug Fixes

* **slack:** slack image rendered requires text in title ([#188](https://github.com/botpress/messaging/issues/188)) ([53141f1](https://github.com/botpress/messaging/commit/53141f11884db2b6d0cdcb0eafa52d9db8484f26))
* **vonage:** fix too many requests when using sandbox ([#176](https://github.com/botpress/messaging/issues/176)) ([59982f2](https://github.com/botpress/messaging/commit/59982f2e2f5a79a2310dd0db3016bc57a7a3c5b1))



## [0.1.13](https://github.com/botpress/messaging/compare/v0.1.12...v0.1.13) (2021-09-14)


### Features

* **apm:** added apm configuration setup ([#167](https://github.com/botpress/messaging/issues/167)) ([a1cc6a0](https://github.com/botpress/messaging/commit/a1cc6a07eda7be1e9245a53951c61a2e03ed635a))
* **webhook:** add convo and user events ([#168](https://github.com/botpress/messaging/issues/168)) ([2e30ddd](https://github.com/botpress/messaging/commit/2e30ddd60807f61332c1f519e269143fbb1ca18a))



## [0.1.12](https://github.com/botpress/messaging/compare/v0.1.11...v0.1.12) (2021-09-02)


### Bug Fixes

* **server:** fix macos binary ([#165](https://github.com/botpress/messaging/issues/165)) ([5b5282b](https://github.com/botpress/messaging/commit/5b5282b24155ae67b32cf71b7adc76569b56b58a))



## [0.1.11](https://github.com/botpress/messaging/compare/v0.1.10...v0.1.11) (2021-08-31)


### Bug Fixes

* **monitoring:** always setup non lazy when spinned ([#158](https://github.com/botpress/messaging/issues/158)) ([2b22a68](https://github.com/botpress/messaging/commit/2b22a689533032eaf4e9eaa49e6a85e157fcba11))



## [0.1.10](https://github.com/botpress/messaging/compare/v0.1.9...v0.1.10) (2021-08-24)


### Bug Fixes

* **chat:** fix crash when replying to null conduit ([#156](https://github.com/botpress/messaging/issues/156)) ([4d0542f](https://github.com/botpress/messaging/commit/4d0542f04451b1f6ab97fd5f63102f333be34cbb))
* **instances:** fix instance service destroy ([#155](https://github.com/botpress/messaging/issues/155)) ([ffeb091](https://github.com/botpress/messaging/commit/ffeb0916c0ea525c816b993013ca5369a788d906))
* **post:** log errors as warnings ([#154](https://github.com/botpress/messaging/issues/154)) ([edf54c2](https://github.com/botpress/messaging/commit/edf54c2cb77f40de2f03f36e0a32a817a3381237))


### Features

* **migration:** implement migration service ([#142](https://github.com/botpress/messaging/issues/142)) ([a6fef7c](https://github.com/botpress/messaging/commit/a6fef7c14fab8116cc0af0d364843ceceb86f719))



## [0.1.9](https://github.com/botpress/messaging/compare/v0.1.8...v0.1.9) (2021-08-23)


### Bug Fixes

* **ci_cd:** fix changelog generation on release ([510040a](https://github.com/botpress/messaging/commit/510040a87bf41428071b591f69eea25777292464))
* **ci_cd:** fix changelog generation on release ([#146](https://github.com/botpress/messaging/issues/146)) ([49e52cc](https://github.com/botpress/messaging/commit/49e52ccf0624ebffdac712d022ce8561bdeeb3ff))
* **health:** send configure event when created ([#144](https://github.com/botpress/messaging/issues/144)) ([58dc686](https://github.com/botpress/messaging/commit/58dc686348ccb2b888aeb4e75be9534c0f5e6021))


### Features

* **board:** host url field ([#145](https://github.com/botpress/messaging/issues/145)) ([cff7316](https://github.com/botpress/messaging/commit/cff73162b53c3c1ab91e89627e81fb33ec31899a))
* **server:** gracefully close websocket connections on server shutdown ([#143](https://github.com/botpress/messaging/issues/143)) ([02b1619](https://github.com/botpress/messaging/commit/02b16195cf5f3e92560054bce84b7eb051124292))
* **webchat:** implement basic webchat ([#126](https://github.com/botpress/messaging/issues/126)) ([aed8705](https://github.com/botpress/messaging/commit/aed8705c345ed69c5a287a93395daa870966bf8b)), closes [#135](https://github.com/botpress/messaging/issues/135)



