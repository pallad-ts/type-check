const TYPE_KEY = '@type' as const;

export class TypeCheck<TType> {
	private typeName!: string;

	readonly clazz!: { new(): any, isType(value: any): value is TType };

	constructor(typeName: string) {
		Object.defineProperty(this, 'typeName', {
			enumerable: false,
			configurable: false,
			value: typeName,
			writable: false
		});

		this.isType = this.isType.bind(this);

		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const check = this;
		this.clazz = class {
			constructor() {
				check.assign(this);
			}

			static isType = check.isType;
		};

		Object.freeze(this);
	}

	assign(object: object & { [TYPE_KEY]?: string[] }) {
		if (object[TYPE_KEY] && Array.isArray(object[TYPE_KEY])) {
			if (!object[TYPE_KEY]!.includes(this.typeName)) {
				object[TYPE_KEY]!.push(this.typeName)
			}
		} else {
			Object.defineProperty(object, TYPE_KEY, {
				value: [this.typeName],
				enumerable: false,
				configurable: false,
				writable: false
			});
		}

		return object;
	}

	isType(value: any): value is TType {
		// eslint-disable-next-line no-null/no-null
		return (typeof value === 'object' || typeof value === 'function') && value !== null && Array.isArray(value[TYPE_KEY]) && value[TYPE_KEY].includes(this.typeName);
	}
}
