#include "stdafx.h"
#include "Exports.h"


void callback_1(CB cb) {
	unsigned char * mem = new unsigned char[4] {0,1,2,3};
	cb(mem,4);
}

void A() {}