import fs from "fs";
interface IProblem {
    slug: string;
    inputs: string[];
    outputs: string[];
}
const BASE_DIR = "/home/ubuntu/codeWars/backend/src/problems";
export const getProblem = async (slug: string): Promise<IProblem> => {
    const inputs = await getInputs(slug);
    const outputs = await getOutputs(slug);
    return {
        slug,
        inputs,
        outputs,
    }
}

const getInputs = async(slug: string): Promise<string[]> => {
    return new Promise((resolve, reject) => {
        fs.readdir(`${BASE_DIR}/${slug}/inputs`, async(err, files) => {
            if(err){
                console.log(err);
            }else{
                await Promise.all(files.map((file) => {
                    return new Promise<string>((resolve, reject) => {
                        fs.readFile(`${BASE_DIR}/${slug}/inputs/${file}`, "utf8", (err, data) => {
                            if(err){
                                reject(err);
                            }
                            resolve(data);
                    })
                })
                })).then((data) => {
                    resolve(data);
                }).catch((e) => reject(e))
            }
        })
    })
}

const getOutputs = async(slug: string): Promise<string[]> => {
    return new Promise((resolve, reject) => {
        fs.readdir(`${BASE_DIR}/${slug}/outputs`, async(err, files) => {
            if(err){
                console.log(err);
            }else{
                await Promise.all(files.map((file) => {
                    return new Promise<string>((resolve, reject) => {
                        fs.readFile(`${BASE_DIR}/${slug}/outputs/${file}`, "utf8", (err, data) => {
                            if(err){
                                reject(err);
                            }
                            resolve(data);
                    })
                })
                })).then((data) => {
                    resolve(data);
                }).catch((e) => reject(e))
            }
        })
    })
}