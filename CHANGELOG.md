# CHANGELOG

## uiconfig.js : logic changed to override brand from server.

1. if tv is on **brandA** and from authwall/lms its set to **brandB**.
2. then first step is to compare only brand names from tv and authwall.
3. if brand mismatch found then we will pickup uiconfig of the **brandB** from authwall and set the uiconfig version to 0 (as launchers will only check if its equal,  ~~not  greater or lesser~~ )
4. tv will recive the uiconfig of the **brandB** with the **uiconfig version 0** and start downloading the uiversion and set **brandB** on tv.

## [1.2.0] - 2022-03-08
### Added
- Allcloudtvs collection for authwall to find out duplicate emac
- add new function in middleware to add in AllCloudTvs collection where emac_wmac Compound index use to find duplicate TV
### Changed
- Tvconfig controller update addtoTvconfig function to update the document when API call of     tv-config
- cats version 2.0.0 merged with1 & 3 version
-tvconfig 2.0.0 version merged with 1.0.0
### Removed
- Tvconfig controller removed the addtoTvconfig2_0 function 

### Fixed
- in collection of Authwalls,Tvonfig,AllcloudTvs update emac, wmac field in Uppercase format

## [1.2.0-1] - 2022-03-08
### Changed
- Tvconfig will take emac,wmac from header instead of body.
### Fixed
- AllcloudTv and Tvonfig will make wmac with colon even if wmac comes without colon.

## [1.2.0-2] - 2022-03-11
### Changed
- source name comparison for prime video made case insensative
### Added
- added logic to remove the entire row if it has zero elements in it, useful when we create dedicated prime video row (by shridhar )


## [1.2.0-3] - 2022-03-24
### Changed
- lastseen logger added with wmac and ip address
- uncommented debug logs from uiconfigs
### Fixed
- middleware real ip address will be used instead of docker ip

## [1.2.0-4] - 2022-03-24
### Fixed
- added check from production in checkAgainstAuthWall(may need to revise)

## [1.2.0-5] - 2022-04-01
### Fixed
- removed the hardcoded checking of datatype in authwall state condition

## [1.2.0-6] - 2022-06-21
### Fixed
- reindexing for removed items  to support older launchers
- Remove voot App tile and row if PRIMEVIDEO feature is enable Assuming it has Widewine L1


## [1.2.0-9] - 2022-06-24
### Changes
- Dockerfile pm2 version specified
- lversion uppercase handled
- mongodb timeout added

## [1.2.0-10] - 2022-07-21
### Fixed
- Remove if PRIMEVIDEO feature is not enable from cats
- Added test folder with csv and enviorment and cats_collection 