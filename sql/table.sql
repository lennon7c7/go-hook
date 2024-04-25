CREATE TABLE `queue`
(
    `id`         int unsigned NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `title`      varchar(100) NOT NULL COMMENT '标题',
    `data`       longtext     NOT NULL COMMENT '数据',
    `createtime` int unsigned NOT NULL COMMENT '创建时间',
    PRIMARY KEY (`id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_general_ci COMMENT ='队列';

CREATE TABLE `api_log`
(
    `id`         int unsigned NOT NULL AUTO_INCREMENT COMMENT 'ID',
    `title`      varchar(100) NOT NULL COMMENT '标题',
    `req_data`   longtext     NOT NULL COMMENT '请求数据',
    `res_data`   longtext     NOT NULL COMMENT '返回数据',
    `status`     varchar(50)  NOT NULL DEFAULT '' COMMENT '状态：pending处理中、success成功、failure失败、query_failure查询失败',
    `createtime` int unsigned NOT NULL COMMENT '创建时间',
    PRIMARY KEY (`id`),
    KEY `title` (`title`),
    KEY `status` (`status`),
    KEY `createtime` (`createtime`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_general_ci COMMENT ='队列';
