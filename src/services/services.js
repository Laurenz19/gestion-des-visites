let generateId = (prefix, value, size)=>{
  let nb = size - (prefix.length + value.toString().length)
  let newId = `${prefix}`

  while(nb>0){
    newId += '0'
    nb--
  }
  newId += value.toString()
  return newId
}

module.exports = generateId