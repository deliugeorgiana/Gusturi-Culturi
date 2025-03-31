/*function f(x){
    return 2*x;
}

a=10; b=15;
for(i=a;i<=f(b);i++)
    console.log(i);

*/

/*
i=0;
while(i<5){
    console.log('*');
    i++;
}
*/

size = 5;
i = 0;

while (i < size) {
  let row = '';
  
  let j = 0;
  while (j < size) {
    if (i === 0 || i === size - 1 || j === 0 || j === size - 1) {
      row += '*';  
    } else {
      row += ' ';  
    }
    j++;
  }
  
  console.log(row);  
  i++;
}
