/**
 * Created by liuyun on 2017/1/18.
 */
import React from 'react';
import ReactDOM from 'react-dom';

// import './index.less';

var CloudAnimate = React.createClass({
    getInitialState() {
        var names = [
            '赫尔曼·威廉·戈林',
            '维尔纳·冯·勃洛姆堡',
            '瓦尔特·冯·布劳希奇',
            '费多尔·冯·博克',
            '威廉·凯特尔',
            '贡特尔·汉斯·冯·克卢格',
            '威廉·约瑟夫·弗朗茨·冯·勒布',
            '威廉·利斯特',
            '卡尔·鲁道夫·格尔德·冯·龙德施泰特',
            '埃尔温·冯·维茨勒本',
            '瓦尔特·冯·赖歇瑙',
            '格奥尔格·冯·屈希勒尔',
            '弗里茨·埃里希·冯·曼施坦因',
            '埃尔温·约翰内斯·尤根·隆美尔',
            '恩斯特·冯·布施',
            '埃瓦尔德·冯·克莱斯特',
            '弗雷德里克·威廉·保卢斯',
            '马克西米连·冯·魏克斯',
            '瓦尔特·莫德尔',
            '费迪南德·舍尔纳',
            '爱华德·米尔契',
            '阿尔伯特·凯塞林',
            '胡戈·施佩勒',
            '沃尔夫冈·冯·里希特霍芬',
            '罗伯特·里特尔·冯·格莱姆',
            '埃里希·雷德尔',
            '卡尔·冯·邓尼茨'
        ];
        return {
            items: names.map((name) => {
                return {
                    name,
                }
            }),
            active: false,
            radius: 80,
            mouseX: 0,
            mouseY: 0,
            d: 150,
            dtr: Math.PI/180,
            size: 300,
            tspeed: 0.3,
            lasta: 1,
            lastb: 1,
            sina: Math.sin(0),
            cosa: Math.cos(0),
            sinb: Math.sin(0),
            cosb: Math.cos(0),
            sinc: Math.sin(0),
            cosc: Math.cos(0),
            howElliptical: 1,
            rootDom: null,
            distr: true,
        }
    },
    componentDidMount() {
        // 随机重排
        let items = this.state.items.sort(() => {
            return Math.random()<0.5?1:-1;
        });
        let max = items.length;
        var {distr, radius} = this.state;
        // 获取根节点
        var dom = ReactDOM.findDOMNode(this);
        // 初始化位置
        let newItems = items.map((item, index) => {
            let phi, theta;
            if( distr ) {
                phi = Math.acos(-1+(2*(index + 1)-1)/max);
                theta = Math.sqrt(max*Math.PI)*phi;
            } else {
                phi = Math.random()*(Math.PI);
                theta = Math.random()*(2*Math.PI);
            }
            // 坐标变换
            item.cx = radius * Math.cos(theta)*Math.sin(phi);
            item.cy = radius * Math.sin(theta)*Math.sin(phi);
            item.cz = radius * Math.cos(phi);
            item.offsetWidth = this.refs[item.name].offsetWidth;
            item.offsetHeight = this.refs[item.name].offsetHeight;
            // 设置样式
            item.style = {};
            item.style.left = item.cx + dom.offsetWidth/2 - item.offsetWidth/2 + 'px';
            item.style.top= item.cy+ dom.offsetHeight/2 - item.offsetHeight/2 + 'px';
            return item;
        });

        this.setState({
            rootDom: dom,
            items: newItems,
        }, () => {
            setInterval(this.update, 30);
        });
    },
    sineCosine(a, b, c) {
        let dtr = this.state.dtr;
        this.setState({
            sina: Math.sin(a * dtr),
            cosa: Math.cos(a * dtr),
            sinb: Math.sin(b * dtr),
            cosb: Math.cos(b * dtr),
            sinc: Math.sin(c * dtr),
            cosc: Math.cos(c * dtr),
        });
    },
    update() {
        let a,b;
        let {items, active, mouseX, mouseY, size, radius, tspeed, sina, cosa, sinb, cosb, sinc, cosc, d, howElliptical, lasta, lastb} = this.state;

        if(active) {
            a = (-Math.min( Math.max( -mouseY, -size ), size ) / radius ) * tspeed;
            b = (Math.min( Math.max( -mouseX, -size ), size ) / radius ) * tspeed;
        } else {
            a = lasta * 0.98;
            b = lastb * 0.98;
        }

        if(Math.abs(a)<=0.01 && Math.abs(b)<=0.01) {
            return;
        }

        let c=0;
        this.sineCosine( a, b, c);
        let newItems = items.map((item) => {
            let rx1 = item.cx;
            let ry1 = item.cy * cosa + item.cz * (-sina);
            let rz1 = item.cy * sina + item.cz * cosa;

            let rx2 = rx1 * cosb + rz1 * sinb;
            let ry2 = ry1;
            let rz2 = rx1 * (-sinb)+ rz1 * cosb;

            let rx3 = rx2 * cosc + ry2 * (-sinc);
            let ry3 = rx2 * sinc + ry2 * cosc;
            let rz3 = rz2;

            item.cx=rx3;
            item.cy=ry3;
            item.cz=rz3;

            let per = d / (d+rz3);

            item.x = ( howElliptical * rx3 * per) - (howElliptical * 2);
            item.y = ry3 * per;
            item.scale = per;
            item.alpha = per;

            item.alpha = (item.alpha - 0.6) * (10/6);
            return item;
        });
        this.setState({
            items: newItems,
            lasta: a,
            lastb: b,
        });
        this.doPosition();
        this.depthSort();
    },
    doPosition() {
        let {rootDom, items} = this.state;
        let l = rootDom.offsetWidth / 2;
        let t = rootDom.offsetHeight / 2;

        let newItems = items.map((item) => {
            item.style.left = item.cx + l - item.offsetWidth / 2 + 'px';
            item.style.top = item.cy + t - item.offsetHeight / 2 + 'px';
            item.style.fontSize = Math.ceil(12 * item.scale / 2) + 8 + 'px';
            item.style.filter = "alpha(opacity=" + 100 * item.alpha + ")";
            item.style.opacity = item.alpha;
            return item;
        });
        this.setState({
            items: newItems,
        })
    },
    depthSort() {
        let {items} = this.state;

        let newItems = items.sort((item1, item2) => {
            if (item1.cz > item2.cz) {
                return -1;
            } else if (item1.cz < item2.cz) {
                return 1;
            } else {
                return 0;
            }
        }).map((item, index) => {
            item.zIndex = index;
            return item;
        });
        this.setState({
            items: newItems,
        })
    },
    onMouseOver() {
        this.setState({
            active: true
        });
    },
    onMouseOut() {
        this.setState({
            active: false
        })
    },
    onMouseMove(e) {
        let dom = ReactDOM.findDOMNode(this);
        let mouseX = e.clientX - (dom.offsetLeft + dom.offsetWidth/2);
        let mouseY = e.clientY - (dom.offsetTop + dom.offsetHeight/2);

        mouseX*=10;
        mouseY*=10;
        this.setState({
            mouseX,
            mouseY,
        });
    },
    render() {
        return (
            <div id="animator"
                onMouseOver={this.onMouseOver}
                onMouseOut={this.onMouseOut}
                onMouseMove={this.onMouseMove}
            >
                {
                    this.state.items.map((item) => {
                        return (
                            React.createElement(
                                'a',
                                {
                                    ref: item.name,
                                    style: item.style,
                                },
                                item.name
                            )
                        )
                    })
                }
            </div>
        )
    }
});

ReactDOM.render(
    <CloudAnimate/>,
    document.getElementById('wrapper')
)