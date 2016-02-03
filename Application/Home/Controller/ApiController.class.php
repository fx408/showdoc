<?php
namespace Home\Controller;
use Think\Controller;
class ApiController extends BaseController {
	protected $paramsTemplate = '|%s|%s|%s|-';
	protected $responseTemplate = '|%s|%s|-';
	
	protected $lineTemplate = '';
	//获取接口数据
	public function getData() {
		$address = @ $_GET["address"];
		
		if($address) {
			$ch = curl_init();
			curl_setopt($ch, CURLOPT_URL, $address);
			curl_setopt($ch, CURLOPT_RETURNTRANSFER,true);
			$result = curl_exec($ch);
			$result && $result = @ json_decode($result, true);
		}
		
		$return = array();
		if(@ $result) {
			$return['params'] = $this->getParams($address);
			$return['response'] = $this->getReponse($result);
			$this->sendResult($return);
		}else{
			$return['error_code'] = 10103 ;
			$return['error_message'] = 'request  fail' ;
			$this->sendResult($return);
		}
	}
	
	protected function getParams($address) {
		$this->lineTemplate = $this->paramsTemplate;
		
		$params = parse_url($address);
		$query = array();
		
		isset($params['query']) && parse_str($params['query'], $query);
		
		$data = $query ? $this->mkLinks($query) : array();
		return implode("\n", $data);
	}
	
	protected function getReponse($data) {
		$this->lineTemplate = $this->responseTemplate;
		
		if(isset($data['data']) && is_array($data['data'])) {
			$innerData = $data['data'];
			$data['data'] = array();
			
			$lines = $this->mkLinks($data);
			
			foreach($innerData as $key=>$item) {
				$arrKeys = array_keys($item);
				$newItem = $arrKeys[0] === 0 ? $item[0] : $item;
				
				$lines[] = "\n**返回值(data.{$key})说明**\n";
				$lines[] = "|参数名|类型|说明|";
				$lines[] = "|:-----  |:-----|-----";
				
				$lines = array_merge($lines, $this->mkLinks($newItem));
			}
			
		} else {
			$lines = $this->mkLinks($data);
		}
		
		return implode("\n", $lines);
	}
	
	protected function mkLinks($data, $preKeys = array()) {
		$res = array();

		foreach($data as $key => $item) {
			$keys = $preKeys;
			$keys[] = $key;
			$name = implode(".", $keys);
			
			$required = empty($item) ? '否' : '是';
			
			if(is_array($item)) {
				$res[] = sprintf($this->lineTemplate, $name, 'Array', $required);
				
				if(!empty($item)) {
					$arrKeys = array_keys($item);
					$newItem = $arrKeys[0] === 0 ? $item[0] : $item;
					$res = array_merge($res, $this->mkLinks($newItem, $keys));
				}
			} else {
				$res[] = sprintf($this->lineTemplate, $name, is_numeric($item) ? 'Number' : 'String', $required);
			}
		}
		return $res;
	}
}