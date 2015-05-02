#include <math.h>
#include <stdio.h>

struct point
{
    double Lon;
    double Lat;
};

point
Point(double Lon, double Lat)
{
    point Point = {Lon, Lat};

    return Point;
}

double
ToRadian(double Degree)
{
    double Result = Degree * M_PI / 180;

    return(Result);
}

double
DistanceBetweenPoints(point PointA, point PointB)
{
    double Result = 0;

    double DeltaLat = ToRadian(PointB.Lat - PointA.Lat);
    double DeltaLon = ToRadian(PointB.Lon - PointA.Lon);
    double Lat1 = ToRadian(PointA.Lat);
    double Lat2 = ToRadian(PointB.Lat);

    double DeltaLatOver2Sin = sin(DeltaLat / 2);
    double DeltaLonOver2Sin = sin(DeltaLon / 2);

    double A = ((DeltaLatOver2Sin * DeltaLatOver2Sin) +
                (DeltaLonOver2Sin * DeltaLonOver2Sin * cos(Lat1) * cos(Lat2)));

    double C = 2 * atan2(sqrt(A), sqrt(1 - A));

    double RadianToMeters = 6371000;

    Result = RadianToMeters * C;

    return Result;
}

int
main(int argc, char **argv)
{
    point PointA = Point(39.984, -75.343);
    point PointB = Point(39.123, -75.534);

    double Distance = DistanceBetweenPoints(PointA, PointB);
    printf("Distance is: %f\n", Distance);

    return 0;
}
