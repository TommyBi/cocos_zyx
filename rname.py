#建议使用python3运行,请将此脚本放到项目路径下
#该脚本将assets下面.ts .js .js.meta .ts.meta这些文件改成新的前后缀
#如果旧的前后缀没有可以不用填默认也可以
#运行前关闭cocos creator
#只会修改文件名，uuid不会变
import os
import re
#文件名前后缀旧
o_qz = 'qqq_'
o_hz = '_qqq'

#文件名前后缀新
n_qz = 'xxx_'
n_hz = '_xxx'

def rName()->None:
    filePath = './assets'
    files = os.walk(filePath)
    for dirpath,dirnames,filenames in files:
        for fileName in filenames:
            if fileName.endswith('.js') or fileName.endswith('.ts') or fileName.endswith('.ts.meta') or fileName.endswith('.js.meta'):
                fileabspath = os.path.join(dirpath,fileName)
                #旧文件有前后缀直接改
                if re.match(r'%s(.*)%s(.*)'%(o_qz,o_hz),fileName):
                    fileNameNew = re.sub(o_qz,n_qz,fileName)
                    fileNameNew = re.sub(o_hz,n_hz,fileNameNew)
                    print("修改旧的前后缀文件{fileName} =====> {fileNameNew}".format(fileName = fileName,fileNameNew = fileNameNew))
                    os.rename(fileabspath,dirpath+'/'+fileNameNew)
                else: #没有前后缀 
                    #取文件名扩展名不包含.     xxx.ts.meta ====> ts.meta
                    fileEndName = re.findall(r'\.(.*)',fileName)
                    fileOnlyName = re.findall(r'(.*?)\.',fileName)
                    fileNameNew = n_qz + fileOnlyName[0] + n_hz +f'.{fileEndName[0]}'
                    os.rename(fileabspath,dirpath+'/'+fileNameNew)
                    print("修改旧的前后缀文件{fileName} =====> {fileNameNew}".format(fileName = fileName,fileNameNew = fileNameNew))


if __name__ == '__main__':
    rName()