# YouzimuCC-electron
YouzimuCC is a speech-to-text client built upon [Elctron](electronjs.org), [IBM Watson Speech to Text](https://www.ibm.com/watson/services/speech-to-text/) and [AWS Transcribe Service](https://aws.amazon.com/transcribe/).  
It would be used by Youzimu (柚子木字幕组) to improve efficiency of daily work flow.  

## Features
* Support two well-known and versatile cloud service providers: IBM Cloud & Amazon AWS. Therefore, they enable us to support multiple languages and audio formats. User can change the language to recognize in Settings.
* Supported languages: 
    * with IBM Cloud: English (US&UK), Modern Standard Arabic, Brazilian Portuguese, Mandarin Chinese, French, Germen, Japanese, Korean, Spanish.
    * with Amazon AWS: English (US&UK&India), Modern Standard Arabic, French, Germen, Hindi, Italian, Korean, Brazilian Portuguese, Spanish.
* For Amazon AWS, we support multiple locations that can help user gain more stable and fluent experience.
* Export results to SRT subtitle format.
* Choose audio file by conveniently "drag & drop"

# How To Use
Please go to: [youzimu.cc](http://youzimu.cc)

# For Developers
* This project is technically based on JavaScript, Node.js, Electron
* This project depends on node modules: 
    * nconf
    * aws-sdk
    * animate.css
    * electron-packager (dev)
    * electron-installer-dmg (dev)

This project is quite simple and straightforward so that you can just read source code to figure out how it works.