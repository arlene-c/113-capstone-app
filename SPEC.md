
# App Specification
<!-- Populate this with your SPEC details. -->
<!-- Template created with CLAUDE for 15-113-->

## Overview

<!-- Brief description of the app, its purpose, and target audience. -->
I want to create a mobile application with Expo Go and React Native to facilitate American Sign Language translation. The purpose of this app should be to allow clear communication between Deaf and hearing individuals, breaking communication barriers and allowing Deaf people to communicate in their natural, first visual language. Since Deaf people are often isolated from everyday English conversations, this app should attempt to help with this discrimination. The target audience is mainly Deaf people, though it can also be for hearing people who have regular communication with Deaf people. 


## Core Features

<!-- List the main features of the app. -->

These are the core features I want the initial prototype to have (more features to come later):
- Home Screen with a button that leads to another page for ASL -> English translation
- The ASL->English page should have a camera and video option, and the user should be able to take a picture or record themselves signing. 
- After they click done, the app should display an English translation 
- For this initial prototype, start simple: implement fingerspelling detection first (so from a user's pictures of the fingerspelling alphabet, the app should be able to detect and display which letter it represented)


Features for later (DON'T IMPLEMENT INITIALLY YET):
- Besides just fingerspelling, the app should also be able to analyze a short video and display the English equivalent of the phrase/word that the user signed
- Ideally, there should be another button on the home screen that leads to another page: English -> ASL translation 
- This should generate some sort of animation or video of the sign that corresponds to the English word/phrase inputted by the user through a textbox (again, should start simple with fingerspelling first and then move on to actual, simple signs later)


## API & Backend

<!-- Describe external APIs, backend services, or Expo API routes used. -->

Implement any external APIs or Expo API routes or certain modules as needed.
Implement any services or models that would be needed for the ASL detection and translation. 
Add all files needed for successful completion of the initial prototype of this app.

## Design & Branding

- **Color palette:** 

Pastel green, white, black

- **Typography:**

EB Garamond (from Google fonts)


- **Style direction:**

Simple, minimalistic, clean, elegant 
The style should be easy to understand and be accessible. 

## Platform Targets

- iOS mobile phone

## Constraints & Non-Goals

<!-- Known limitations, things explicitly out of scope, or technical constraints. -->

All English and ASL word translations would be impossible to implement (for every single word). Therefore, keep the scope of this project simple initially -- when first implementing start with the basic letters and stop there until directed to continue. 