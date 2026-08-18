import mongoose, { Document } from 'mongoose';
export interface IUser extends Document {
    name: string;
    email: string;
    passwordHash: string;
    accountType: 'EXPLORER' | 'B2C' | 'B2B' | 'PENDING';
    role: 'BUSINESS_OWNER' | 'MANAGER' | 'EMPLOYEE' | 'DESIGNER' | 'SUPPORT' | 'EXPLORER' | 'SUPER_ADMIN';
    tenantId?: mongoose.Types.ObjectId;
    status: 'LEAD' | 'ACTIVE' | 'SUSPENDED';
    mobile?: string;
    countryCode?: string;
    country?: string;
    dateOfBirth?: string;
    gender?: string;
    profileStatus: 'INCOMPLETE' | 'PARTIAL' | 'COMPLETED';
    intentType?: 'B2B' | 'B2C' | 'Explorer';
    companyName?: string;
    companyEmail?: string;
    companyPhone?: string;
    website?: string;
    state?: string;
    city?: string;
    businessAddress?: string;
    businessType?: string;
    industry?: string;
    yearEstablished?: string;
    numEmployees?: number;
    numProducts?: number;
    productCategories?: string[];
    description?: string;
    experience?: string;
    b2bExpectedUsers?: number;
    b2bAdChannels?: string[];
    b2bSocialPlatforms?: string[];
    b2bMainRequirement?: string;
    b2bExpectedUsage?: string;
    b2bAdProblems?: string;
    b2cProdName?: string;
    b2cProdCategory?: string;
    b2cProdWebsite?: string;
    b2cAdMethod?: string;
    b2cAdTypes?: string[];
    b2cExpectedAds?: number;
    explorerLearnIntent?: string;
    explorerInterestService?: string;
    explorerOptionalBiz?: string;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IUser, {}, {}, {}, Document<unknown, {}, IUser, {}, mongoose.DefaultSchemaOptions> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IUser>;
export default _default;
//# sourceMappingURL=user.model.d.ts.map