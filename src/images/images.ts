export default class ImageContainer{
    private images = {
        grid_bg: require('./../../assets/images/grid_bg.jpg'),
    };

    constructor(){
    }

    public getImage(imageID: string){
        let imageURI = this.images[imageID];
        return imageURI;
    }
    
}