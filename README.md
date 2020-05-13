# VitalsPlus

**Install NodeJS if it is not installed**
### `https://nodejs.org/en/`
<br />

**Install nvm** (Instructions taken from https://github.com/nvm-sh/nvm):
### `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash`
### `export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"`
<br />

**Clone this repository**
### `git clone https://github.com/stamaleiferis/vitalsplus-frontend.git`
<br />

**Move to the cloned repository and switch node version to v11.15.0**
### `nvm use 11.15.0`
<br />

**Install modules**
### `npm i`
<br />

**Start the development server and go to localhost:3000 in google chrome**
### `npm start`
<br />

**Flash MAX32630 with either ECG_HR.bin or PPG_SPO2.bin for plotting/displaying ECG and HR or PPG and** SPO2
### `https://docs.google.com/document/d/1jAMK64rHXkSn6TmI0D0kkX7jyASWeXUmm8Q93DI6N0U/`
<br />

**Press connect button on the web interface, wait for MAX86150 to show and connect**
<br />
**Wait 5 seconds for recording to start**
<br />
**If need to restart, press disconnect button and connect again**
