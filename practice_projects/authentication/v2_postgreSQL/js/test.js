function test(){
    try{
        new Promise((resolve, reject)=>{
            reject( new Error('12321331'))
        })
        // function a(){
        //     throw new Error(13123131)
        // }
        // a()
    }catch(err){
        console.log(err.message)
    }
}
console.log(11233132)
test();