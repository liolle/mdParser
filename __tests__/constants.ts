export namespace CONSTANT {
  export const BaseHeaders = String.raw`
# This is a heading 1
## This is a heading 2
### This is a heading 3
#### This is a heading 4
##### This is a heading 5
###### This is a heading 6
`.trim();

  export const BaseList = `
- A
  - Sub list of A
   - Element of sub list of A
- B
  - Sub list of B
Element
  - Sub list of B
- Simple LI`;

  export const BaseList2 = `
- A
  - [ ] Sub task of A
    - [X] Checked task
- B
  - [ ] Sub task of B
- [ ] Tasks C
  - [ ] Sub task of C
  - [] not a task
  - [x]not a task`;

  export const SampleImage1 =
    'https://atlas.kodevly.com/_next/image?url=https%3A%2F%2Fd22f1kls6ex9ii.cloudfront.net%2Fposts%2F6f46774c7c103ee%2Ffile1.avif&w=1920&q=75';
}
