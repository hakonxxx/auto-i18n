enum EnumA {
  A = 'hello'
}

interface Interface<T, U> {

}

function options(opts: {
  types?: string;
  tag: string | number;
}): void {

}

function $extend<T, U>(first: T, second: U): T & U {
  return Object.assign(first, second); // 示意而已
}

type TypeA = {

}

const obj = {
  a: 1
}

obj['a']

const jsx = <div>
  hahah
  {'bbb'}
  {[].map(() => 'aaa')}
  {true ? 'ccc' : 'ddd'}
</div>


`a\n\\12`

// `1212${b}1${a}1${12}21`