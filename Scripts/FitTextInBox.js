function checkChar(char, fonttable, boxwidth) {
  if (!(char in fonttable) || ((fonttable[char].w + fonttable[char].xadv)*fonttable.scale > boxwidth)) {return false}
  return true;
}

function getTextWidth(text, fonttable, boxwidth) {
  var width = 0;
  for (char of text) {
    if (!checkChar(char, fonttable, boxwidth)) {continue}
    width += fonttable[char].w + fonttable[char].xadv;
  }
  return width * fonttable.scale
}

function FitTextInBox(text, fonttable, boxsize, pxbetweenlines, linecom, pagecom, comform, textoffsetcom) {
  if (Object.keys(fonttable).length < 4) {return text}
  if (fonttable.fontsize > boxsize[1]) {return ""}
  
  const commandsRegex = (linecom.fixForRegex()+"|"+pagecom.fixForRegex()+"|"+comform.fixForRegex().replaceAll("<command>", "[\\s\\S]*")+"|"+textoffsetcom.fixForRegex().replaceAll("<px>", "\\d*")).toRegex("g");
  const textlist = text.split(commandsRegex).filter(element => element != undefined);
  const commands = text.match(commandsRegex);
  var newtext = '', x = 0, y = 0;
  
  for (p of range(0, textlist.length)) {
    const part = textlist[p];
    if (p) {
      const com = commands[p-1];
      if (com == linecom) {
        x = 0
        y += fonttable.fontsize + pxbetweenlines;
        if (y + fonttable.fontsize > boxsize[1]) {y = 0; newtext+=pagecom}
        else {newtext+=linecom}
      }
      else if (com == pagecom) {x = 0, y = 0; newtext+=pagecom}
      else {newtext+=commands[(p-1)/2]}
    }
    if (!part.length) {continue}
    for (var word of part.split(' ')) {
      if (!word.length) {word = " "}
      else (word = (!x ? '' : ' ') + word)
      const wordwidth = getTextWidth(Freeze(word), fonttable, boxsize[0]);
      if (wordwidth > boxsize[0]) {
        if (word[0]==" ") {word = word.slice(1)}
        if (x) {
          y += fonttable.fontsize + pxbetweenlines;
          if (y + fonttable.fontsize > boxsize[1]) {y = 0}
          newtext += (!y ? pagecom : linecom);
        }
        x = 0;
        for (var char of Freeze(word)) {
          const charwidth = getTextWidth(char, fonttable, boxsize[0]);
          if (x + charwidth > boxsize[0]) {
            x = 0;
            y += fonttable.fontsize + pxbetweenlines;
            if (y + fonttable.fontsize > boxsize[1]) {y = 0}
	           newtext += (!y ? pagecom : linecom);
          }
          newtext += char;
          x += charwidth;
        }
	  }
	     else if (x + wordwidth > boxsize[0]) {
        if (word[0]==" ") {word = word.slice(1)}
        x = getTextWidth(Freeze(word), fonttable, boxsize[0]);
        y += fonttable.fontsize + pxbetweenlines;
        if (y + fonttable.fontsize > boxsize[1]) {y = 0}
	       newtext += (!y ? pagecom : linecom) + word;
	     }
    	  else {newtext += word; x += wordwidth}
	}
  }
  return newtext;
}