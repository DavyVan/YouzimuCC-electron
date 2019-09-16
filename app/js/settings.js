'use strict';

const {ipcRenderer, remote} = require('electron');
const {app} = remote;
const nconf = require('nconf');
nconf.file({file: app.getAppPath() + '/config.json'});
var cloudConfig = null;
const regionsPerLine = 2;

/****************************************
 * Read config file and display
 ****************************************/
var provider = nconf.get('provider');
var region = nconf.get('region');
var language = nconf.get('language');
// console.log('provider: ' + nconf.get('provider'));
// console.log('region: ' + nconf.get('region'));
// console.log('language: ' + nconf.get('language'));

// set provider
document.getElementById('cloud-provider-radio-' + provider).setAttribute('checked', 'true');

// list all available regions first
var regionRadioDiv = document.getElementById('region-radio-div');
regionRadioDiv.innerHTML = '';      // Clear everything, if any.

if (provider === 'aws')
    cloudConfig = require('./js/aws-config');
else if (provider === 'ibm')
    cloudConfig = require('./js/ibm-config');

listRegions(regionRadioDiv, cloudConfig);

// set region
document.getElementById(region).setAttribute('checked', 'true');

// list all available languages
var languageSelect = document.getElementById('language-select');
languageSelect.innerHTML = '';

var _html = '';
for (var i = 1; i <= cloudConfig.language_available.length; i++) {
    _html += '<option value="' + cloudConfig.language_available[i-1].name + '">' + cloudConfig.language_available[i-1].name_cn + '</option>'
}
languageSelect.innerHTML = _html;

// Because there is only one language available now, so we do not need to set it.

// When change language
languageSelect.addEventListener('change', (event)=>{
    language = event.target.value;
    // console.log(language);
});

/****************************************
 * Change the region list when change the provider
 ****************************************/
var providerInputs = document.getElementsByName('cloudProvider');
providerInputs.forEach(element => {     // for each provider radio
    element.addEventListener('click', (event)=>{        // on click
        if (event.target.value != provider) {       // if provider has been changed
            cloudConfig = require('./js/' + event.target.value + '-config');
            listRegions(regionRadioDiv, cloudConfig);
            provider = event.target.value;      // update global var
        }
    });
});

/****************************************
 * Validate and apply changes
 ****************************************/
document.getElementById('confirm-btn').addEventListener('click', (event)=>{
    // Provider has already been stored in 'provider'
    // Read region
    var regionInputs = document.getElementsByName('region');
    region = null;
    for (var i = 0; i < regionInputs.length; i++) {
        if (regionInputs[i].checked == true) {
            region = regionInputs[i].value;
        }
    }
    if (region == null) {
        var noticeDiv = document.getElementById('notice-div');
        noticeDiv.innerHTML = '请您选择一个服务器位置';
        noticeDiv.classList.add('animated', 'shake');
        noticeDiv.addEventListener('animationend', (event)=>{
            noticeDiv.classList.remove('animated', 'shake');
        });
        return;
    }
    // Language has already been stored in 'language'
    // console.log(provider);
    // console.log(region);
    // console.log(language);

    // save to file
    nconf.set('provider', provider);
    nconf.set('region', region);
    nconf.set('language', language);
    nconf.save();

    // send msg to main (index) window to reset requester
    ipcRenderer.send('setting-changed', provider);
    // Close window
    ipcRenderer.send('close-setting-window');
});

/****************************************
 * When canceled
 ****************************************/
document.getElementById('cancel-btn').addEventListener('click', (event)=>{
    // Close window with nothing done
    ipcRenderer.send('close-setting-window');
});

function listRegions(containerEl, cloudConfig) {
    var _html = '';
    for (var i = 1; i <= cloudConfig.region_available.length; i++) {
        // If this is the first in the line
        if (i % regionsPerLine == 1) {
            _html += '<div class="row">';
        }
        // for each item
        _html += '<div class="col-sm-6">' +
            '<div class="custom-control custom-radio custom-control-inline">' +
            '<input class="custom-control-input" type="radio" name="region" id="' + cloudConfig.region_available[i - 1].region + '" value="' + cloudConfig.region_available[i - 1].region + '">' +
            '<label class="custom-control-label" for="' + cloudConfig.region_available[i - 1].region + '">' + cloudConfig.region_available[i - 1].region_name_cn + '</label>' +
            '</div>' +
            '</div>';
        // If this is the last in the line
        if (i % regionsPerLine == 0) {
            _html += '</div>';
        }
    }
    containerEl.innerHTML = _html;
}