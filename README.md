### kronkite-v2
Full scale rewrite of [Kronkite](https://github.com/seanttaylor/kronkite), a web app tracking trending searches, YouTube and Spotify content and related news.

Kronkite version 2 (v2) encompasses the same core functions as its v1 predecessor (tracking trending Google Searches, YouTube videos and Spotify tracks) while removing the Angular 1.x foundation of v1 and leveraging a microservices architecture to realize the benefits of a distributed system.

Being built on Angular 1.x made v1 a larger, bulkier codebase and resulted in a larger intial download for the user on application startup. Migrating from Angular 1.x to a vanilla JavaScript codebase improved the developer experience (DX) by obviating the need to think "in Angular" or approaching problems the "Angular way."

Additionally there were fewer problems that were particular to Angular code during the optimization and deployment phases of the development cycle.

In lieu of a large opinionated framework v2 uses the Sandbox pattern as well as the Pub/Sub pattern to enforce code structure. This reduced code footprint and improve DX by not requiring knowledge of a proprietary framework in order to contribue to this code base.

This project is part of an exploration in distributed systems. The backend supporting v2 encompasses separate services written in Ruby/Sinatra and Node.js/Express communication via HTTP/REST with the client-side code. 

For a more thorough explanaton of the backend supporting this app please see the [README](https://github.com/seanttaylor/kronkite-sever) for the kronkite-server repository.

