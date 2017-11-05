import HostModel from '../models/host.model';

class HostDao{
    static async getAllHost(){

        let result = await HostModel.find();
        return result;
    }
}