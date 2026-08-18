import mongoose, { Document } from 'mongoose';
export interface ILead extends Document {
    userId: mongoose.Types.ObjectId;
    name: string;
    email: string;
    countryCode: string;
    phone: string;
    country?: string;
    dateOfBirth?: string;
    gender?: string;
    profileStatus: 'INCOMPLETE' | 'PARTIAL' | 'COMPLETED';
    intentType: 'B2B' | 'B2C' | 'Explorer';
    status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'APPROVED' | 'CONVERTED' | 'REJECTED';
    source?: string;
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
declare const _default: mongoose.Model<ILead, {}, {}, {}, Document<unknown, {}, ILead, {}, mongoose.DefaultSchemaOptions> & ILead & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ILead>;
export default _default;
//# sourceMappingURL=lead.model.d.ts.map