-- ----------------------------
-- Table struct for sample
-- ----------------------------
DROP TABLE IF EXISTS `sample`;
CREATE TABLE `sample` (
  `id` integer(11) not null AUTO_INCREMENT COMMENT '编号',
  `login_name` varchar(20) not null COMMENT '账号',
  `password` varchar(128) not null COMMENT '密码',
  `real_name` varchar(20) COMMENT '姓名',
  `sex` varchar(10) COMMENT '性别',
  `age` integer(11) COMMENT '年龄',
  `weight` float(11) default 0 COMMENT '体重',
  `insert_time` datetime COMMENT '新增时间',
  `update_time` datetime COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table struct for member
-- ----------------------------
DROP TABLE IF EXISTS `member`;
CREATE TABLE `member` (
  `id` integer(11) not null AUTO_INCREMENT COMMENT '编号',
  `member_id` varchar(20) not null COMMENT '会员号',
  `member_name` varchar(20) COMMENT '会员名字',
  `member_pwd` varchar(30) COMMENT '密码',
  `is_member` integer(1) default 1 COMMENT '区分普通用户会员',
  `is_use` integer(1) default 1 COMMENT '启用区分',
  `sex` integer(1) COMMENT '性别',
  `birthday` date COMMENT '生日',
  `identified` varchar(30) COMMENT '证件号',
  `phone` char(11) COMMENT '电话',
  `last_login_time` date COMMENT '最后登录时间',
  `insert_time` datetime COMMENT '新增时间',
  `update_time` datetime COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table struct for mbr_coupon
-- ----------------------------
DROP TABLE IF EXISTS `mbr_coupon`;
CREATE TABLE `mbr_coupon` (
  `id` integer(11) not null AUTO_INCREMENT COMMENT '编号',
  `member_id` varchar(20) not null COMMENT '会员号',
  `coupon_sn` varchar(30) COMMENT '折扣编码',
  `num` integer(2) COMMENT '优惠券数量',
  `dateymd` date COMMENT '有效期',
  `is_used` integer(11) COMMENT '是否使用',
  `ticket_sn` varchar(20) COMMENT '关联票号',
  `insert_time` datetime COMMENT '新增时间',
  `update_time` datetime COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table struct for order
-- ----------------------------
DROP TABLE IF EXISTS `order`;
CREATE TABLE `order` (
  `id` integer(11) not null AUTO_INCREMENT COMMENT '编号',
  `order_sn` varchar(20) not null COMMENT '订单号',
  `ticket_sn` varchar(30) not null COMMENT '票号',
  `member_id` integer(10) COMMENT '会员号',
  `num` integer(10) default 0 COMMENT '购买数量',
  `price` integer(4) default 0 COMMENT '实际购买价格',
  `dateymd` date COMMENT '采购日期',
  `time` time COMMENT '购票时间',
  `payid` varchar(50) COMMENT '支付id',
  `pay_type` integer(1) COMMENT '支付方式',
  `order_status` integer(1) COMMENT '订单状态',
  `qupiaoren_name` varchar(20) COMMENT '取票人',
  `phone` char(11) not null COMMENT '取票人电话',
  `refunddate` date COMMENT '退票日期',
  `change_code` varchar(10) COMMENT '交换码',
  `qrcode_url` varchar(255) COMMENT '二维码',
  `youxiaoymd` date COMMENT '有效日期',
  `insert_time` datetime COMMENT '新增时间',
  `update_time` datetime COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table struct for ticket_cat
-- ----------------------------
DROP TABLE IF EXISTS `ticket_cat`;
CREATE TABLE `ticket_cat` (
  `id` integer(11) not null AUTO_INCREMENT COMMENT '编号',
  `cat_sn` varchar(20) not null COMMENT '票种类',
  `cat_name` varchar(20) COMMENT '票名',
  `insert_time` datetime COMMENT '新增时间',
  `update_time` datetime COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table struct for ticket
-- ----------------------------
DROP TABLE IF EXISTS `ticket`;
CREATE TABLE `ticket` (
  `id` integer(11) not null AUTO_INCREMENT COMMENT '编号',
  `cat_sn` varchar(20) not null COMMENT '票种类',
  `ticket_sn` varchar(20) not null COMMENT '票号',
  `ticket_name` varchar(11) COMMENT '票名',
  `store_num` integer(6) COMMENT '库存量',
  `coupon_sn` varchar(20) COMMENT '折扣编码',
  `scenic_sn` varchar(20) COMMENT '景点编码',
  `member_price` float(10,2) default 0 COMMENT '会员单价',
  `online_price` float(10,2) default 0 COMMENT '网上单价',
  `market_price` float(10,2) default 0 COMMENT '门店价',
  `dateymd` date COMMENT '使用日期',
  `is_use` integer(1) not null default 1 COMMENT '启用',
  `info_from` varchar(50) COMMENT '来源',
  `insert_time` datetime COMMENT '新增时间',
  `update_time` datetime COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table struct for coupon
-- ----------------------------
DROP TABLE IF EXISTS `coupon`;
CREATE TABLE `coupon` (
  `id` integer(11) not null AUTO_INCREMENT COMMENT '编号',
  `coupon_sn` varchar(20) not null COMMENT '折扣编码',
  `coupon` integer(3) default 0 COMMENT '折扣',
  `coupon_name` varchar(50) COMMENT '折扣名称',
  `is_use` integer(1) default 0 COMMENT '是否启用',
  `insert_time` datetime COMMENT '新增时间',
  `update_time` datetime COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table struct for scenic 
-- ----------------------------
DROP TABLE IF EXISTS `scenic`;
CREATE TABLE `scenic` (
  `id` integer(11) not null AUTO_INCREMENT COMMENT '编号',
  `scenic_sn` integer(4) not null COMMENT '景点编号',
  `scenic_name` varchar(50) not null COMMENT '景点名称',
  `scenic_need_know` varchar(200) COMMENT '景点预订须知',
  `scenic_info` varchar(1000) COMMENT '景区简介',
  `scenic_traffic` varchar(1000) COMMENT '景区交通',
  `insert_time` datetime COMMENT '新增时间',
  `update_time` datetime COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table struct for scenic_gallery
-- ----------------------------
DROP TABLE IF EXISTS `scenic_gallery`;
CREATE TABLE `scenic_gallery` (
  `id` integer(11) not null AUTO_INCREMENT COMMENT '编号',
  `scenic_sn` varchar(20) not null COMMENT '景点编码',
  `image_url` varchar(255) COMMENT '图片url',
  `image_desc_url` varchar(255) COMMENT '目标图片url',
  `image_original_url` varchar(255) COMMENT '原始图片url',
  `thumb_url` varchar(255) COMMENT '缩略图url',
  `insert_time` datetime COMMENT '新增时间',
  `update_time` datetime COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

