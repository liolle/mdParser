export namespace CONSTANT {
export const BaseHeaders = String.raw`
# This is a heading 1
## This is a heading 2
### This is a heading 3
#### This is a heading 4
##### This is a heading 5
###### This is a heading 6
`.trim();

export const escaped3 = String.raw`\*_This line will be italic and show the asterisks_\*`;

export const BaseList = 
`
- A
  - Sub list of A
   - Element of sub list of A
- B
  - Sub list of B
Element
  - Sub list of B
- Simple LI`;

export const BaseList2 = 
`
- A
  - [ ] Sub task of A
    - [X] Checked task
- B
  - [ ] Sub task of B
- [ ] Tasks C
  - [ ] Sub task of C
  - [] not a task
  - [x]not a task`;

export const BaseList3 = 
`
- This is a list item.
- This list is unordered.

Here's how to include an image with alt text and a title:`;

export const BaseList4 = 
`
- This is a list item.
- This list is unordered.

Here's how to include an image with alt text and a title:

`;

export const BaseList5 = 
`
- This is a list item.
- This list is unordered.



Here's how to include an image with alt text and a title:

`;

export const BaseList6 = `
- first list.




- second list.


`;

export const Tasklist1 = 
`
- A
  - Sub list of A
[ ] should not be a task
  - Sub list of A
`;

export const Tasklist2 = 
`
- A
  - Sub list of A
[ ] should not be a task, and it should be appended to the last li,
 this should also be appended to the last li
  - Sub list of A
`;

export const SampleImage1 =
`https://atlas.kodevly.com/_next/image?url=https%3A%2F%2Fd22f1kls6ex9ii.cloudfront.net%2Fposts%2F6f46774c7c103ee%2Ffile1.avif&w=1920&q=75`;

export const InlineCode1 = '`backticks`';

export const code1 = 
`function print(arg) {
  console.log(arg)
}
`;

export const code3 = 
`def add(a,b):
  return a+b
`;

export const CodeBlock1 = 
`
${'```'} js
${code1}
${'```'}`;

export const CodeBlock2 = 
`${'```'}
let message = 'Hello world';
alert(message);
${'```'}
`;

export const CodeBlock3 = 
`
${'```'} py
${code3}
${'```'}`;

export const OrderedList = 
String.raw
`
1. first ol 
2. second ol 
  - nested ul
  1. first nested ol 
  2. second nested ol
3. third ol
  1. other nested ol
`
}
