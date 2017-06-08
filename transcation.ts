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
            this.ctx = ctx;
            console.log("BeginTranscation propertyName:", propertyName);
            ctx.BeginTranscation();
            let result;
            try {
                result = await method.apply(this, arguments);
                await ctx.Commit();
                console.log("Transcation successful!");
                return result;
            } catch (error) {
                console.log("RollBack propertyName:", propertyName);
                await ctx.RollBack();
                throw error;
            }
        }
    }
}