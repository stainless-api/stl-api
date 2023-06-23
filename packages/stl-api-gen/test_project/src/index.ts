interface Stl {
    magic<T>(val: T): T
}

const stl: Stl = {
    magic<T>(val: T): T {
        return val;
    }
}

type T = {
    str: string,
}

const schema = stl.magic<T>(); 