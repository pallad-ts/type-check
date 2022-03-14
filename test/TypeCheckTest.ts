import {TypeCheck} from "@src/TypeCheck";
import {assert, IsExact} from "conditional-type-checks";

describe('TypeCheck', () => {
	const CHECK = new TypeCheck<Bar>('test');

	class Bar {
		readonly test!: 'type';
	}

	it('stored typename is not enumerable', () => {
		expect(Object.getOwnPropertyDescriptor(CHECK, 'typeName'))
			.toHaveProperty('enumerable', false);
	});

	describe('using clazz', () => {
		const CHECK = new TypeCheck<Foo>('foo');

		class Foo extends CHECK.clazz {
			readonly fooProperty!: string;
		}

		it('assures that instances of objects created from extended class are valid', () => {
			const instance = new Foo();
			expect(CHECK.isType(instance))
				.toBe(true);

			expect(Foo.isType(instance))
				.toBe(true);
		});

		it('assures that instances of objects created from other checks are not valid', () => {
			const ANOTHER_CHECK = new TypeCheck('ANOTHER');

			class Bar extends ANOTHER_CHECK.clazz {

			}

			expect(CHECK.isType(new Bar()))
				.toBe(false);
		});

		it('types', () => {
			type Func = (value: any) => value is Foo;
			assert<IsExact<typeof CHECK.isType, Func>>(true);
			assert<IsExact<typeof Foo.isType, Func>>(true);
		});
	});

	describe('type check', () => {
		it('fails for other type checks', () => {
			const OTHER_TYPE_CHECK = new TypeCheck('test2');

			const object = CHECK.assign({});

			expect(OTHER_TYPE_CHECK.isType(object))
				.toBe(false);
		});

		it('makes sure that object is coming from type check', () => {
			const object = CHECK.assign({});

			expect(CHECK.isType(object))
				.toBe(true);
		});

		it('types', () => {
			type Func = (value: any) => value is Bar;
			assert<IsExact<typeof CHECK.isType, Func>>(true);
		});

		it.each([
			[{}],
			// eslint-disable-next-line no-null/no-null
			[null],
			[undefined],
			[1],
			['string'],
			[true],
			[false],
			[[]],
			[() => {
			}]
		])('ignores values that are not coming from a check', value => {
			expect(CHECK.isType(value))
				.toBe(false);
		});
	});

	describe('multiple type checks', () => {
		const CHECK_1 = new TypeCheck('c1');
		const CHECK_2 = new TypeCheck('c2');
		const CHECK_3 = new TypeCheck('c3');

		it('allows to register multiple types', () => {
			const value = {};
			CHECK_1.assign(value);
			CHECK_2.assign(value);

			expect(CHECK_1.isType(value)).toBe(true);
			expect(CHECK_2.isType(value)).toBe(true);
			expect(CHECK_3.isType(value)).toBe(false);

			CHECK_3.assign(value);

			expect(CHECK_1.isType(value)).toBe(true);
			expect(CHECK_2.isType(value)).toBe(true);
			expect(CHECK_3.isType(value)).toBe(true);
		});
	});
});
