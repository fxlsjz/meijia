'use strict';

/**
 * 我的模块
 */

angular.module('wechat')
	.config(['$stateProvider', '$locationProvider', '$ionicConfigProvider', '$urlRouterProvider', '$controllerProvider', '$compileProvider', '$filterProvider', '$provide', '$ocLazyLoadProvider', 'helperProvider',
		function($stateProvider, $locationProvider, $ionicConfigProvider, $urlRouterProvider, $controllerProvider, $compileProvider, $filterProvider, $provide, $ocLazyLoadProvider, helperProvider) {

			$stateProvider
			//我的
//				.state('tab.my', {
//					url: "/my",
//					cache: false,
//					views: {
//						"tab-my": {
//							controller: 'MyIndexCtrl',
//							templateUrl: 'apps/modules/my/templates/index.html'
//						}
//					},
//					resolve: {
//						loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
//							return $ocLazyLoad.load(helperProvider.loadModuleFile('my', ['Me-index.css', 'MyIndexCtrl.js']));
//						}]
//					}
//				})
				//我的
				.state('my', {
					url: "/my",
					cache: false,
					controller: 'MyIndexCtrl',
					templateUrl: 'apps/modules/my/templates/index.html',
					resolve: {
						loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
							return $ocLazyLoad.load(helperProvider.loadModuleFile('my', ['Me-index.css', 'MyIndexCtrl.js']));
						}]
					},
					authorizedRoles: ['@']
				})
				//修改个人资料
				.state('my-modify-data', {
					url: "/my/modify-data/?changed_phone&se_code",
					cache: false,
					controller: 'ModifyDataCtrl',
					templateUrl: 'apps/modules/my/templates/modify-data.html',
					resolve: {
						loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
							return $ocLazyLoad.load(helperProvider.loadModuleFile('my', ['Me-index.css', 'ModifyDataCtrl.js']));
						}]
					},
					authorizedRoles: ['@']
				})

			//修改手机号
			.state('my-modify-phone', {
				url: "/my/modify-phone/",
				cache: false,
				controller: 'ModifyPhoneCtrl',
				templateUrl: 'apps/modules/my/templates/modify-phone.html',
				resolve: {
					loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
						return $ocLazyLoad.load(helperProvider.loadModuleFile('my', ['Me-index.css', 'ModifyDataCtrl.js']));
					}]
				}
			})

			//我的收藏
			.state('my-mycollect', {
				url: "/my/my-collect",
				cache: false,
				controller: 'MyCollectCtrl',
				templateUrl: 'apps/modules/my/templates/my-collect.html',
				resolve: {
					loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
						return $ocLazyLoad.load(helperProvider.loadModuleFile('my', ['collect.css', 'MyIndexCtrl.js']));
					}]
				},
				authorizedRoles: ['@']
			})

			//地址列表
			.state('my-addrecss', {
					url: "/my/addrecss/?form",
					cache: false,
					controller: 'AddrecssCtrl',
					templateUrl: 'apps/modules/my/templates/addrecss.html',
					resolve: {
						loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
							return $ocLazyLoad.load(helperProvider.loadModuleFile('my', ['Me-index.css', 'AddrecssCtrl.js']));
						}]
					},
					authorizedRoles: ['@']
				})
				//添加送货地址
				.state('my-addaddress', {
					url: "/my/addaddress",
					cache: false,
					controller: 'AddAddressCtrl',
					templateUrl: 'apps/modules/my/templates/add-address.html',
					resolve: {
						loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
							return $ocLazyLoad.load(helperProvider.loadModuleFile('my', ['Me-index.css', 'AddrecssCtrl.js']));
						}]
					}
				})
				//添加服务地址
				.state('my-addServiceAddress', {
					url: "/my/addServiceAddress",
					controller: 'addServiceAddress',
					templateUrl: 'apps/modules/my/templates/add-service-address.html',
					resolve: {
						loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
							return $ocLazyLoad.load(helperProvider.loadModuleFile('my', ['Me-index.css', 'AddrecssCtrl.js']));
						}]
					}
				})
				//编辑地址
				/*.state('my-edit-address', {
					url: "/my/edit-address",
					//cache:false,
					controller: 'EditAddressCtrl',
					templateUrl: 'apps/modules/my/templates/edit-address.html',
					resolve: {
						loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
							return $ocLazyLoad.load(helperProvider.loadModuleFile('my', ['index.css', 'AddrecssCtrl.js']));
						}]
					}
				})*/

			//商品订单列表
			.state('my-commoditylist', {
				url: "/my/commoditylist/?paySuccess&timestamp",
				cache: false,
				controller: 'CommodityCtrl',
				templateUrl: 'apps/modules/my/templates/commoditylist.html',
				resolve: {
					loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
						return $ocLazyLoad.load(helperProvider.loadModuleFile('my', ['Me-index.css', 'CommodityCtrl.js']));
					}]
				},
				authorizedRoles: ['@']
			})

			//商品订单详情
			.state('my-order-detail', {
					url: "/my/order-detail?oid&actualprice&balance&time&timestamp",
					controller: 'CommodityOrderDetail',
					templateUrl: 'apps/modules/my/templates/order-detail.html',
					resolve: {
						loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
							return $ocLazyLoad.load(helperProvider.loadModuleFile('my', ['Me-index.css', 'CommodityCtrl.js']));
						}]
					}
				})
				//商品评价
				.state('my-myassess', {
					url: "/my/goods-assess/?timestamp",
					controller: 'GoodsAssessCtrl',
					templateUrl: 'apps/modules/my/templates/goods-assess.html',
					resolve: {
						loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
							return $ocLazyLoad.load(helperProvider.loadModuleFile('my', ['assess.css', 'CommodityCtrl.js']));
						}]
					}
				})
				//选择评价
				.state('my-selece-evaluation', {
					url: "/my/selece-evaluation/",
					controller: 'SeleceEvaluationCtrl',
					templateUrl: 'apps/modules/my/templates/selece-evaluation.html',
					resolve: {
						loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
							return $ocLazyLoad.load(helperProvider.loadModuleFile('my', ['assess.css', 'CommodityCtrl.js']));
						}]
					}
				})

			//支付方式
			.state('my-pay', {
				url: "/my/pay-method?oid?actualprice?balance?time?type?ticket?processType",
				//					cache:false,
				controller: 'PayMethodCtrl',
				templateUrl: 'apps/modules/my/templates/pay-method.html',
				resolve: {
					loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
						return $ocLazyLoad.load(helperProvider.loadModuleFile('my', ['pay-method.css', 'PayMethodCtrl.js']));
					}]
				}
			})

			//物流详情
			.state('my-send', {
				url: "/my/send-detail/:id",
				controller: 'SendDetail',
				templateUrl: 'apps/modules/my/templates/send-detail.html',
				resolve: {
					loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
						return $ocLazyLoad.load(helperProvider.loadModuleFile('my', ['send-detail.css', 'MyIndexCtrl.js']));
					}]
				}
			})

			//设置
			.state('my-seeting', {
				url: "/my/seeting",
				controller: 'SeetingCtrl',
				templateUrl: 'apps/modules/my/templates/seeting.html',
				resolve: {
					loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
						return $ocLazyLoad.load(helperProvider.loadModuleFile('my', ['Me-index.css', 'MyIndexCtrl.js']));
					}]
				}
			})

			//购物车
			.state('my-car', {
				url: "/my/shop-car",
				cache: false,
				controller: 'CarIndexCtrl',
				templateUrl: 'apps/modules/my/templates/shop-car.html',
				resolve: {
					loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
						return $ocLazyLoad.load(helperProvider.loadModuleFile('my', ['car.css', 'CarIndexCtrl.js']));
					}]
				},
				authorizedRoles: ['@']
			})

			//商品订单填写界面
			.state('my-submit', {
				url: "/my/submit-order",
				cache: false,
				controller: 'CarSubmitCtrl',
				templateUrl: 'apps/modules/my/templates/submit-order.html',
				resolve: {
					loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
						return $ocLazyLoad.load(helperProvider.loadModuleFile('my', ['submit.css', 'CarSubmitCtrl.js']));
					}]
				}
			})

			//扫一扫
			.state('my-scan-it', {
				url: "/my/scan-it",
				controller: 'ScanItCtrl',
				templateUrl: 'apps/modules/my/templates/scan-it.html',
				resolve: {
					loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
						return $ocLazyLoad.load(helperProvider.loadModuleFile('my', ['Me-index.css', 'MyIndexCtrl.js']));
					}]
				}
			})

			//防伪验证详情
			.state('my-scan-detail', {
					url: "/my/scan-detail/:code",
					//cache:false,
					controller: 'ScanDetailCtrl',
					templateUrl: 'apps/modules/my/templates/scan-detail.html',
					resolve: {
						loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
							return $ocLazyLoad.load(helperProvider.loadModuleFile('my', ['Me-index.css', 'MyIndexCtrl.js']));
						}]
					}
				})
				//我的套票
				.state('my-ticket', {
					url: "/my/ticket",
					cache: false,
					controller: 'MyTicketCtrl',
					templateUrl: 'apps/modules/my/templates/my-ticket.html',
					resolve: {
						loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
							return $ocLazyLoad.load(helperProvider.loadModuleFile('my', ['me-ticket.css', 'MyTicketCtrl.js']));
						}]
					},
					authorizedRoles: ['@']
				})
				//套票预约
				.state('my-ticket-order', {
					url: "/my/ticket-order",
					cache: false,
					controller: 'MyTicketOrderCtrl',
					templateUrl: 'apps/modules/my/templates/ticket-order.html',
					resolve: {
						loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
							return $ocLazyLoad.load(helperProvider.loadModuleFile('my', ['me-ticket.css', 'MyTicketCtrl.js']));
						}]
					}
				})
				//使用记录
				.state('my-use-log', {
					url: "/my/use-log/?pid&oid1",
					cache: false,
					controller: 'MyTicketUseLogCtrl',
					templateUrl: 'apps/modules/my/templates/use-log.html',
					resolve: {
						loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
							return $ocLazyLoad.load(helperProvider.loadModuleFile('my', ['me-ticket.css', 'MyTicketCtrl.js']));
						}]
					}
				})
				//预约详情
				.state('my-uselog-detail', {
					url: "/my/use-log-detail/:orid",
					cache: false,
					controller: 'MyTicketUseLogDetailCtrl',
					templateUrl: 'apps/modules/my/templates/use-log-detail.html',
					resolve: {
						loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
							return $ocLazyLoad.load(helperProvider.loadModuleFile('my', ['me-ticket.css', 'MyTicketCtrl.js']));
						}]
					}
				})
				//关于
				.state('my-set-about', {
					url: "/my/myset-about",
					cache: false,
					controller: 'mySetAbout',
					templateUrl: 'apps/modules/my/templates/myset-about.html',
					resolve: {
						loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
							return $ocLazyLoad.load(helperProvider.loadModuleFile('my', ['Me-index.css', 'MyIndexCtrl.js']));
						}]
					}
				})
				//我的钱包
				.state('my-wallet', {
					url: "/my/my-wallet",
					cache: false,
					controller: 'myWallet',
					templateUrl: 'apps/modules/my/templates/my-wallet.html',
					resolve: {
						loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
							return $ocLazyLoad.load(helperProvider.loadModuleFile('my', ['Me-index.css', 'MyIndexCtrl.js']));
						}]
					}
				})
				//意见反馈
				.state('my-feedback', {
					url: "/my/feedback",
					//cache:false,
					controller: 'MySeetingFeedbackCal',
					templateUrl: 'apps/modules/my/templates/feedback.html',
					resolve: {
						loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
							return $ocLazyLoad.load(helperProvider.loadModuleFile('my', ['Me-index.css', 'feedback.js']));
						}]
					}
				})
				//我的消息
				.state('my-message', {
					url: "/my/message",
					cache: false,
					controller: 'MyMessageCal',
					templateUrl: 'apps/modules/my/templates/message.html',
					resolve: {
						loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
							return $ocLazyLoad.load(helperProvider.loadModuleFile('my', ['Me-index.css', 'MyMessageCtrl.js']));
						}]
					},
					authorizedRoles: ['@']
				})
				//广告
				.state('my-ad', {
					url: "/my/ad",
					controller: 'MyAD',
					templateUrl: 'apps/modules/my/templates/ad.html',
					resolve: {
						loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
							return $ocLazyLoad.load(helperProvider.loadModuleFile('my', ['Me-index.css', 'MyIndexCtrl.js']));
						}]
					}
				})
				//积分规则
				.state('integral-rule', {
					url: "/my/integral",
					cache: false,
					controller: 'IntegralRule',
					templateUrl: 'apps/modules/my/templates/integral-rule.html',
					resolve: {
						loadMyCtrl: ['$ocLazyLoad', function($ocLazyLoad) {
							return $ocLazyLoad.load(helperProvider.loadModuleFile('my', ['me-integral-rule.css', 'IntegralRule.js']));
						}]
					},
					authorizedRoles: ['@']
				})
		}
	]);