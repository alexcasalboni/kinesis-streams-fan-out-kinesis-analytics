create:
	npm run create -- -N processor1 -P ${ROLE_ARN} -I arn:aws:kinesis:ap-northeast-1:167855287371:stream/MasterStream
	npm run create -- -N processor2 -P ${ROLE_ARN} -I arn:aws:kinesis:ap-northeast-1:167855287371:stream/MasterStream
	npm run create -- -N processor3 -P ${ROLE_ARN} -I arn:aws:kinesis:ap-northeast-1:167855287371:stream/MasterStream
	npm run create -- -N processor4 -P ${ROLE_ARN} -I arn:aws:kinesis:ap-northeast-1:167855287371:stream/MasterStream

toggle:
	npm run toggle -- -N processor1
	npm run toggle -- -N processor2
	npm run toggle -- -N processor3
	npm run toggle -- -N processor4

write:
	for i in `seq 30`; do \
		npm run putrecords -- -I MasterStream -N 500 & \
	done
