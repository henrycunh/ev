<div align="center">

# ev
> a tool for versioning, securing and easily sharing environment variables

</div>

## Features
- ⏱ **Version control** - allows for storing environment variables securely in git
- 🔑 **Secure** - uses a single key to secure your variables
- 🧑‍💻 **Easy sharing** - sharing the key means sharing your variables
- 🛠 **Great DX** - tools for easily managing keys  

<p align="center">
  <table>
    <tbody>
      <td align="center">
        <img width="2000" height="0"><br>
        Explore the documentation<br>
        <sub>
        <a href="#initializing">initializing</a> • <a href="#adding-new-variables">adding new variables</a> • <a href="#exporting-variables-into-environment">exporting into environment</a> • <a href="#removing-variables">removing variables</a></sub><br>
        <img width="2000" height="0">
      </td>
    </tbody>
  </table>
</p>

## Getting started

### Initializing

Install [**Node >= 14**](https://nodejs.org/en/) and run:
```
npx ev
```
It will prompt you for a new **secret key** and create two new files:
  - `.ev/vars` - where your environment variables are encrypted and safely stored,
  - `.ev/secret` - your secret key, whose must not be version controlled

And add `.ev/secret` to `.gitignore`

You can install `ev` globally <sup>*(so you wont have to prepend `npx`)*</sup> by running,
```bash
npm install -g ev
```

### Adding new variables
```bash
ev MY_KEY=VALUE OTHER_KEY=OTHER_VALUE
```
<sup>ℹ This will add the `MY_KEY` and `OTHER_KEY` variables, if the variables already exists, their value will be overrided</sup>


### Exporting variables into the environment
```bash
ev | source
```
<sup>ℹ This will export every variable into the environment</sup>

You can test it by running

```bash
ev TEST=123 && ev | source && echo $TEST
```
<sup>ℹ This should print `Added 1 variables.` followed by `123`.</sup>

### Removing variables
```bash
ev rm MY_KEY OTHER_KEY
```
<sup>ℹ This will remove the `MY_KEY` and `OTHER_KEY` variables</sup>

### Listing variables
```bash
ev ls
```
<sup>ℹ This will list all variables</sup>
```bash
ev ls MY_KEY
```
<sup>ℹ This will list the `MY_KEY` variable</sup>

### Changing the secret key
```bash
ev change-secret
```
<sup>ℹ This will prompt for the old key and the new one, if the old key is correct, it will re-encrypt the variables with the new one</sup>


### Setting the secret key
In case you mistype your secret, you can just run this to type the secret again
```bash
ev set-secret
```
<sup>ℹ This will prompt for the secret</sup>

### Using different environments
You can append the option `--env` <sup>*(or `-e`)*</sup> on any command to specify a different environment
```bash
ev -e staging MY_KEY=VALUE_IN_STAGING
```
<sup>ℹ The variables for each environment is stored in a different file</sup>


