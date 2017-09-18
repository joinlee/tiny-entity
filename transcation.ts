import { IDataContext } from './tinyDB';
/**
 * 
 * 
 * @export
 * @param {*} target
 * @param {string} propertyName
 * @param {TypedPropertyDescriptor<Function>} descriptor
 */
export function Transaction(ctx: IDataContext) {
    return (target: any, propertyName: string, descriptor: TypedPropertyDescriptor<Function>) => {
        let method = descriptor.value;
        descriptor.value = async function () {
            if (!this.ctx) {
                this.ctx = ctx;
            }
            this.ctx.BeginTranscation();
            let result;
            try {
                result = await method.apply(this, arguments);
                let r = await this.ctx.Commit();
                if (r === true) {
                    this.ctx = null;
                }
                return result;
            } catch (error) {
                console.log("RollBack propertyName:", propertyName);
                if (this.ctx) {
                    await this.ctx.RollBack();
                    this.ctx = null;
                }
                throw error;
            }
        }
    }
}