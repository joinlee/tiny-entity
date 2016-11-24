/**
 * 
 * 
 * @export
 * @param {*} target
 * @param {string} propertyName
 * @param {TypedPropertyDescriptor<Function>} descriptor
 */
export function Transaction(target: any, propertyName: string, descriptor: TypedPropertyDescriptor<Function>) {
    let method = descriptor.value;
    descriptor.value = async function () {
        console.log("BeginTranscation propertyName:", propertyName);
        this.ctx.BeginTranscation();
        let result;
        try {
            result = await method.apply(this, arguments);
            this.ctx.Commit();
            return result;
        } catch (error) {
            console.log("RollBack propertyName:", propertyName);
            await this.ctx.RollBack();
            throw error;
        }
    }
}