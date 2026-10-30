module.exports = (file, dictionary) => {
  let template = file.toString();
  for(const key in dictionary){     
    if(typeof dictionary[key] === 'object')
      template = template.replace(new RegExp('{{'+key+'}}', 'g'), JSON.stringify(dictionary[key], null, 2));
    else
      template = template.replace(new RegExp('{{'+key+'}}', 'g'), dictionary[key]);
  }

  return template;
};