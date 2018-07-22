export default class ResourceContainer{
    private images = {
        grid_bg: require('./../../assets/images/grid_bg.jpg'),
    };

    private textures = {
        emoji_smile_diffuse: require('./../../assets/models/emoji_smile_diffuse.png'),
        emoji_smile_normal: require('./../../assets/models/emoji_smile_normal.png'),
        emoji_smile_specular: require('./../../assets/models/emoji_smile_specular.png'),
        // arrow: require('./../../assets/models/arrow.mtl')

    };

    private models = {
        emoji_smile: require('./../../assets/models/emoji_smile.vrx'),
        arrow: require('./../../assets/models/arrow.obj')
    };

    constructor(){
    }

    public getImage(imageID: string){
        let imageURI = this.images[imageID];
        return imageURI;
    }

    public getModel(modelID: string){
        let modelURI = this.models[modelID];
        return modelURI;
    }

    public getTexture(modelID: string){
        let modelURI = this.textures[modelID];
        return modelURI;
    }

    
}