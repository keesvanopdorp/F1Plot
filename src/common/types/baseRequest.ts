export default interface BaseRequest {
    MRData: {
        xmlns: string;
        series: string;
        url: string;
        limit: string;
        offset: string;
        total: string;
    }
}