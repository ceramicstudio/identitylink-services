const fetch = require('node-fetch')

const myFunction = async () => {
  try {
    const res = await fetch(
      'https://gist.githubusercontent.com/pi0neerpat/5019f31d74244768e87b30a4f79aadb8/raw/3d19095451f30488b592e3025a30d2a6b0ab637b/gistfile1.txt'
    )
    console.log(await res.text());
  } catch (e) {
    console.log(e)
  }
}

myFunction();
