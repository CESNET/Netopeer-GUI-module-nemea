<?php
/*
 * Copyright (C) 2012-2013 CESNET
 *
 * LICENSE TERMS
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in
 *    the documentation and/or other materials provided with the
 *    distribution.
 * 3. Neither the name of the Company nor the names of its contributors
 *    may be used to endorse or promote products derived from this
 *    software without specific prior written permission.
 *
 * ALTERNATIVELY, provided that this notice is retained in full, this
 * product may be distributed under the terms of the GNU General Public
 * License (GPL) version 2 or later, in which case the provisions
 * of the GPL apply INSTEAD OF those given above.
 *
 * This software is provided ``as is'', and any express or implied
 * warranties, including, but not limited to, the implied warranties of
 * merchantability and fitness for a particular purpose are disclaimed.
 * In no event shall the company or contributors be liable for any
 * direct, indirect, incidental, special, exemplary, or consequential
 * damages (including, but not limited to, procurement of substitute
 * goods or services; loss of use, data, or profits; or business
 * interruption) however caused and on any theory of liability, whether
 * in contract, strict liability, or tort (including negligence or
 * otherwise) arising in any way out of the use of this software, even
 * if advised of the possibility of such damage.
 *
 */
namespace FIT\Bundle\ModuleNemeaBundle\Controller;

use FIT\NetopeerBundle\Controller\ModuleControllerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Response;

class ModuleController extends \FIT\NetopeerBundle\Controller\ModuleController implements ModuleControllerInterface
{
	/**
	 * @inheritdoc
	 *
	 * @Template("FITModuleNemeaBundle:Module:section.html.twig")
	 */
	public function moduleAction($key, $module = null, $subsection = null)
	{
		$res = $this->prepareDataForModuleAction("FITModuleNemeaBundle", $key, $module, $subsection);

		/* parent module did not prepares data, but returns redirect response,
		 * so we will follow this redirect */
		$test_data = "<?xml version='1.0' encoding='UTF-8'?><nemea-supervisor><available-modules><search-paths></search-paths><modules><module><name>123</name><description>Example module for counting number of incoming flow records.</description><number-out-ifc>1</number-out-ifc><number-in-ifc>9</number-in-ifc><parameter></parameter></module><module><name>231</name><description>Example module for counting number of incoming flow records.</description><number-out-ifc>1</number-out-ifc><number-in-ifc>4</number-in-ifc><parameter></parameter></module><module><name>312</name><description>Example module for counting number of incoming flow records.</description><number-out-ifc>1</number-out-ifc><number-in-ifc>2</number-in-ifc><parameter></parameter></module><module><name>end</name><description>konec</description><number-out-ifc>0</number-out-ifc><number-in-ifc>1</number-in-ifc><parameter></parameter></module></modules></available-modules><modules><module><name>DTEST_test21</name><enabled>True</enabled><path></path><params>localhost,asdf_s21</params><trapinterfaces><interface><note></note><type>UNIXSOCKET</type><direction>IN</direction><params></params></interface><interface><note></note><type>TCP</type><direction>OUT</direction><params>asdf_s21_o</params></interface><interface><note></note><type>SERVICE</type><direction></direction><params>service_test21</params></interface></trapinterfaces></module><module><name>123</name><enabled>True</enabled><path></path><params></params><trapinterfaces><interface><note></note><type>UNIXSOCKET</type><direction>IN</direction><params></params></interface><interface><note></note><type>UNIXSOCKET</type><direction>IN</direction><params></params></interface><interface><note></note><type>UNIXSOCKET</type><direction>IN</direction><params></params></interface><interface><note></note><type>TCP</type><direction>IN</direction><params>asdf_s21_o</params></interface><interface><note></note><type>UNIXSOCKET</type><direction>IN</direction><params></params></interface><interface><note></note><type>UNIXSOCKET</type><direction>IN</direction><params></params></interface><interface><note></note><type>UNIXSOCKET</type><direction>IN</direction><params></params></interface><interface><note></note><type>UNIXSOCKET</type><direction>IN</direction><params></params></interface><interface><note></note><type>UNIXSOCKET</type><direction>IN</direction><params></params></interface><interface><note></note><type>UNIXSOCKET</type><direction>OUT</direction><params>scsdcsdc</params></interface></trapinterfaces></module><module><name>rewend</name><enabled>True</enabled><path></path><params>erwer</params><trapinterfaces><interface><note></note><type>UNIXSOCKET</type><direction>IN</direction><params>scsdcsdc</params></interface></trapinterfaces></module><module><name>DTEST_logger</name><enabled>True</enabled><path></path><params>-t -T -w /data/xkrobo01/dns_amp_test/detected.log &lt;AMPLIFICATION_ALERT&gt;</params><trapinterfaces><interface><note></note><type>TCP</type><direction>IN</direction><params>asdf_s21_o</params></interface><interface><note></note><type>SERVICE</type><direction></direction><params>service_dns_logger</params></interface></trapinterfaces></module></modules></nemea-supervisor>";
		$test_data = "<?xml version='1.0' encoding='UTF-8'?><nemea-supervisor><available-modules><search-paths><path>/ava/bin/</path></search-paths><modules><module><name>123</name><description>Example module for counting number of incoming flow records.</description><number-out-ifc>1</number-out-ifc><number-in-ifc>9</number-in-ifc><parameter></parameter></module><module><name>231</name><description>Example module for counting number of incoming flow records.</description><number-out-ifc>1</number-out-ifc><number-in-ifc>4</number-in-ifc><parameter></parameter></module><module><name>312</name><description>Example module for counting number of incoming flow records.</description><number-out-ifc>1</number-out-ifc><number-in-ifc>2</number-in-ifc><parameter></parameter></module><module><name>end</name><description>konec</description><number-out-ifc>0</number-out-ifc><number-in-ifc>1</number-in-ifc><parameter></parameter></module></modules></available-modules><modules><module><name>DTEST_test21</name><enabled>True</enabled><path>/dns/bin</path><params>localhost,asdf_s21</params><trapinterfaces><interface><note></note><type>UNIXSOCKET</type><direction>IN</direction><params>asdf_mer_o</params></interface><interface><note></note><type>UNIXSOCKET</type><direction>OUT</direction><params>asdf_s21_o</params></interface><interface><note></note><type>SERVICE</type><direction></direction><params>service_test21</params></interface></trapinterfaces></module><module><name>rewend</name><enabled>True</enabled><path>/home/bin/end</path><params>erwer</params><trapinterfaces><interface><note></note><type>UNIXSOCKET</type><direction>IN</direction><params>asdf_s21_o</params></interface></trapinterfaces></module><module><name>end3</name><enabled>True</enabled><path>/home/bin/end</path><params>fwed</params><trapinterfaces><interface><note></note><type>UNIXSOCKET</type><direction>IN</direction><params>asdf_mer_o</params></interface></trapinterfaces></module><module><name>end</name><enabled>True</enabled><path>/home/bin/end</path><params>fdsf</params><trapinterfaces><interface><note></note><type>UNIXSOCKET</type><direction>IN</direction><params>asdf_mer_o</params></interface></trapinterfaces></module><module><name>DTEST_test_mer</name><enabled>True</enabled><path>/cesta/bin</path><params>localhost,asdf_mer</params><trapinterfaces><interface><note></note><type>UNIXSOCKET</type><direction>IN</direction><params>localhost,asdf_mer</params></interface><interface><note></note><type>UNIXSOCKET</type><direction>OUT</direction><params>asdf_mer_o</params></interface><interface><note></note><type>SERVICE</type><direction></direction><params>service_test_mer</params></interface></trapinterfaces></module><module><name>DTEST_logger</name><enabled>True</enabled><path>/dns/bin</path><params>-t -T -w /data/xkrobo01/dns_amp_test/detected.log &lt;AMPLIFICATION_ALERT&gt;</params><trapinterfaces><interface><note></note><type>UNIXSOCKET</type><direction>IN</direction><params>asdf_s21_o</params></interface><interface><note></note><type>SERVICE</type><direction></direction><params>service_dns_logger</params></interface></trapinterfaces></module></modules></nemea-supervisor> ";
		$post_vals = $this->getRequest()->get('nemeaForm');
		if (!empty($post_vals)) {
			return new Response(json_encode($test_data));
		}
		$configXML = $this->getRequest()->get('configXML');
		if (!empty($configXML)) {
			return new Response(json_encode($configXML));
		}

		if ($res instanceof RedirectResponse) {
			return $res;

			// data were prepared correctly
		} else { 
			return $this->getTwigArr();
		}

	}

}
