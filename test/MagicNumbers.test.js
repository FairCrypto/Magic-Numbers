// SPDX-License-Identifier: MIT

const assert = require('assert');
const { Contract } = require('ethers');
const { Web3Provider } = require('@ethersproject/providers');
const {toBigInt} = require("../src/utils");

const MagicNumbers = artifacts.require("MagicNumbers");

require('dotenv').config();

const extraPrint = process.env.EXTRA_PRINT;

const isPrime = (n) => {
    if (isNaN(n) || !isFinite(n) || n % 1 || n < 2) return false;
    const  m = Math.sqrt(n);
    for (let i = 2; i <= m; i++) if (n % i === 0) return false;
    return true;
}

function* fib (n) {
    let a = 0n;
    let b = 1n;
    let _;
    while (n >= 0) {
        yield a;
        _ = a;
        a = b;
        b = b + _;
        n = n - 1;
    }
}

const largestFib = (b = 256) => {
    const iter = fib(1000);
    let i = 0;
    let next = {done: false};
    while (!next.done) {
        next = iter.next();
        const nextFib = next.value;
        if (extraPrint) console.log(i, nextFib);
        if (nextFib > 2n**BigInt(b)-1n) return i-1;
        i++;
    }
}

contract("Magic Numbers Library", async () => {

    let numbers;
    let numbersEthers;
    const provider = new Web3Provider(web3.currentProvider);

    const estGasPrime = (n) => numbersEthers.estimateGas.isPrime(n, {gasLimit: 30_000_000}).then(_ => _.toNumber())
    const estGasFib2 = (n) => numbersEthers.estimateGas.isFib2(n, {gasLimit: 30_000_000}).then(_ => _.toNumber())

    before(async () => {
        try {
            numbers = await MagicNumbers.deployed();
            numbersEthers = new Contract(numbers.address, numbers.abi, provider);
        } catch (e) {
            console.error(e)
        }
    })

    it("Should find correct number of primes in a given natural numbers interval", async () => {
        const from = 7098260;
        const to = 7098384;
        const gas = await numbersEthers.estimateGas.findPrimes(from, to).then(_ => _.toNumber()) - 21_000;
        const primes = await numbersEthers.findPrimes(from, to).then(_ => _.toNumber());
        assert.ok(primes === 12);
        if (extraPrint) console.log('gas', gas, 'primes', primes)
    });

    it("Should assert Border Case Primes as non-Primes", async () => {
        const borderCasePrimes = [
            3_215_031_751,
            4_759_123_141,
            1_122_004_669_633,
            2_152_302_898_747,
            3_474_749_660_383,
            341_550_071_728_320,
        ];
        for await (const p of borderCasePrimes) {
            assert.ok(!(await numbers.isPrime(p)));
        }
    })

    it("Should assert Pseudo Primes as non-Primes", async () => {
        const pseudoPrimes = [
            2047, 3277, 4033, 4681, 8321, 15841, 29341, 42799, 49141, 52633, 65281, 74665, 80581, 85489, 88357, 90751
        ];
        for await (const p of pseudoPrimes) {
            assert.ok(!(await numbers.isPrime(p)));
        }
    })

    it("Should assert True Primes", async () => {
        const truePrimes = [
            2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97,
            101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193,
            197, 199, 211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277, 281,
        ]
        for await (const p of truePrimes) {
            assert.ok(await numbers.isPrime(p));
        }
    })

     it("Should estimate gas amount for prime numbers test function", async () => {
        const from = 7112646;
        const to = 7112773
        const delta = to - from;
        const testArray1 = Array(delta).fill(null).map((_, idx) => idx + from);
        let count = 0
        for await (const p of testArray1) {
            if (await numbers.isPrime(p)) {
                if (extraPrint) console.log(p, await estGasPrime(p) - 21_000);
                count++
                assert.ok(isPrime(p) === await numbers.isPrime(p), 'bad prime ' + p);
            }
        }
    });

    it("AUX: should list first 90 Fibonacci Numbers && assert index for a biggest 62-bit Fib", async () => {
        assert.ok(largestFib(62) === 90);
    });

    it("Should test first 90 Fibonacci Numbers", async () => {
        for (const f of Array.from(fib(90))) {
            if (extraPrint)
                console.log(f, await numbers.isFib2(f), await estGasFib2(f) - 21_000,);
        }
    });

    it("Should correctly assert non-Fibonacci numbers", async () => {
        const falseFibs = [
            956722026041n - 1n, // 60
            956722026041n + 1n, // 60
            1548008755920n - 1n, //61
            1548008755920n + 1n, //61
            2880067194370816120n + 1n, // 90
            2880067194370816120n - 1n, // 90
            //135301852344706746049n - 1n, //98
            //135301852344706746049n + 1n, //98
            //218922995834555169026n - 1n, //99
            //218922995834555169026n + 1n, //99
            //354224848179261915075n - 1n, //100
            //354224848179261915075n + 1n, //100
            //293825989466396564333419951255644330166833468672422805842178911936214659279n + 1n,
            //475420437734698220747368027166749382927701417016557193662268716376935476241n + 1n,
            //769246427201094785080787978422393713094534885688979999504447628313150135520n + 1n,
            //1244666864935793005828156005589143096022236302705537193166716344690085611761n + 1n,
            //2013913292136887790908943984011536809116771188394517192671163973003235747281n + 1n,
            //3258580157072680796737099989600679905139007491100054385837880317693321359042n + 1n,
            //5272493449209568587646043973612216714255778679494571578509044290696557106323n + 1n,
            //8531073606282249384383143963212896619394786170594625964346924608389878465365n + 1n,
            //13803567055491817972029187936825113333650564850089197542855968899086435571688n + 1n,
            //22334640661774067356412331900038009953045351020683823507202893507476314037053n + 1n,
            //36138207717265885328441519836863123286695915870773021050058862406562749608741n + 1n,
            //58472848379039952684853851736901133239741266891456844557261755914039063645794n + 1n,
            //94611056096305838013295371573764256526437182762229865607320618320601813254535n,
        ];
        for (const f of falseFibs) {
            assert.ok(!(await numbers.isFib2(f)), 'good Fib? ' + f);
            if (extraPrint) console.log(f, await estGasFib2(f) - 21_000);
        }
    })

    it("Should correctly assert true Fibonacci numbers", async () => {
        const trueFibs = [
            7778742049n, //30
            956722026041n, // 60
            1548008755920n, //61
            2880067194370816120n, // 90
            //135301852344706746049n, //98
            //218922995834555169026n, //99
            //354224848179261915075n, //100
            //293825989466396564333419951255644330166833468672422805842178911936214659279n,
            //475420437734698220747368027166749382927701417016557193662268716376935476241n,
            //769246427201094785080787978422393713094534885688979999504447628313150135520n,
            //1244666864935793005828156005589143096022236302705537193166716344690085611761n,
            //2013913292136887790908943984011536809116771188394517192671163973003235747281n,
            //3258580157072680796737099989600679905139007491100054385837880317693321359042n,
            //5272493449209568587646043973612216714255778679494571578509044290696557106323n,
            //8531073606282249384383143963212896619394786170594625964346924608389878465365n,
            //13803567055491817972029187936825113333650564850089197542855968899086435571688n,
            //22334640661774067356412331900038009953045351020683823507202893507476314037053n,
            //36138207717265885328441519836863123286695915870773021050058862406562749608741n,
            //58472848379039952684853851736901133239741266891456844557261755914039063645794n,
        ];
        for (const f of trueFibs) {
            assert.ok(await numbers.isFib2(f), 'bad Fib? ' + f);
            if (extraPrint) console.log(f, await estGasFib2(f) - 21_000);
        }
    })

})

